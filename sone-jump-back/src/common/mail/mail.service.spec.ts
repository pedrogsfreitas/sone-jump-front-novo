import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

const TO = 'aluno@example.com';
const ASSUNTO = 'Confirme seu e-mail';
const CORPO = 'Acesse https://jumpapi.com.br/verify?token=abc123';

function buildService(values: Record<string, string | undefined>) {
  const config = { get: (key: string) => values[key] } as ConfigService;
  const service = new MailService(config);
  const errors: string[] = [];
  const logs: string[] = [];
  jest
    .spyOn(service['logger'], 'error')
    .mockImplementation((message: unknown) => errors.push(String(message)));
  jest
    .spyOn(service['logger'], 'log')
    .mockImplementation((message: unknown) => logs.push(String(message)));
  return { service, errors, logs };
}

function mockFetch(response: Partial<Response> | Error) {
  const fn = jest.fn(() =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response as Response),
  );
  global.fetch = fn;
  return fn;
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('MailService — sem provedor configurado', () => {
  it('fora de produção, o e-mail vai para o log (é assim que se testa o link localmente)', async () => {
    const { service, logs } = buildService({ NODE_ENV: 'development' });

    await service.send(TO, ASSUNTO, CORPO);

    expect(logs.join('\n')).toContain(CORPO);
  });

  it('em produção sem chave, registra erro em vez de falhar calado', async () => {
    const { service, errors, logs } = buildService({ NODE_ENV: 'production' });

    await service.send(TO, ASSUNTO, CORPO);

    expect(errors.join('\n')).toContain('RESEND_API_KEY ausente');
    // O corpo carrega token de uso único: em produção nunca vai para o log.
    expect(logs.join('\n')).not.toContain(CORPO);
  });
});

describe('MailService — envio pelo Resend', () => {
  it('manda remetente, destinatário e chave para a API do provedor', async () => {
    const fetchMock = mockFetch({ ok: true, status: 200 });
    const { service } = buildService({
      NODE_ENV: 'production',
      RESEND_API_KEY: 're_chave',
      MAIL_FROM: 'JUMP <nao-responda@jumpapi.com.br>',
    });

    await service.send(TO, ASSUNTO, CORPO);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('https://api.resend.com/emails');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer re_chave',
    );
    expect(JSON.parse(init.body as string)).toMatchObject({
      from: 'JUMP <nao-responda@jumpapi.com.br>',
      to: [TO],
      subject: ASSUNTO,
    });
  });

  it('erro do provedor vai para o log COM o motivo, não só o status', async () => {
    mockFetch({
      ok: false,
      status: 403,
      text: () =>
        Promise.resolve(
          '{"message":"You can only send testing emails to your own email address"}',
        ),
    });
    const { service, errors } = buildService({
      NODE_ENV: 'production',
      RESEND_API_KEY: 're_chave',
    });

    await service.send(TO, ASSUNTO, CORPO);

    // Exatamente o diagnóstico que faltou quando os e-mails não chegavam.
    expect(errors[0]).toContain('HTTP 403');
    expect(errors[0]).toContain('only send testing emails');
  });

  it('log do erro é truncado para não despejar a resposta inteira do provedor', async () => {
    mockFetch({
      ok: false,
      status: 500,
      text: () => Promise.resolve('x'.repeat(5000)),
    });
    const { service, errors } = buildService({
      NODE_ENV: 'production',
      RESEND_API_KEY: 're_chave',
    });

    await service.send(TO, ASSUNTO, CORPO);

    expect(errors[0].length).toBeLessThan(700);
  });

  it('falha de rede não derruba quem chamou — envio é best-effort', async () => {
    mockFetch(new Error('ECONNRESET'));
    const { service, errors } = buildService({
      NODE_ENV: 'production',
      RESEND_API_KEY: 're_chave',
    });

    await expect(service.send(TO, ASSUNTO, CORPO)).resolves.toBeUndefined();
    expect(errors.join('\n')).toContain('Erro de rede');
  });
});
