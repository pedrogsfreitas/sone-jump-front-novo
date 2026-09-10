import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Envio de e-mail com dois transportes, escolhidos pela configuração:
 *
 * - **Resend**, quando `RESEND_API_KEY` existe. É HTTP puro via `fetch`, sem
 *   dependência nova no projeto — trocar de provedor é reescrever este método.
 * - **Console**, caso contrário. O e-mail vai para o log em vez de sumir. Isso é o que
 *   torna a recuperação de senha testável de ponta a ponta em desenvolvimento, sem
 *   credencial nenhuma: o link aparece no terminal e funciona.
 *
 * Em produção sem chave configurada, `send` registra um erro em vez de falhar em
 * silêncio — um e-mail que não chega não pode parecer um e-mail entregue.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async send(to: string, subject: string, text: string): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';

    // Fora de produção o conteúdo vai para o log SEMPRE, mesmo com provedor
    // configurado. Sem isso, configurar a chave tirava a única forma de testar o
    // fluxo localmente: o Resend em sandbox só entrega para o e-mail da própria
    // conta, então todo teste com outro endereço falharia sem deixar o link à mão.
    // Em produção isso nunca acontece — o texto carrega um token de uso único, e
    // registrá-lo equivaleria a guardar a redefinição de senha em texto puro.
    if (!isProduction) {
      this.logger.log(`[e-mail] para: ${to} | assunto: ${subject}\n${text}`);
    }

    if (!apiKey) {
      if (isProduction) {
        this.logger.error(
          `RESEND_API_KEY ausente: e-mail para ${to} NÃO foi enviado.`,
        );
      }
      return;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:
            this.config.get<string>('MAIL_FROM') ??
            'JUMP <onboarding@resend.dev>',
          to: [to],
          subject,
          text,
        }),
      });

      if (!response.ok) {
        // O corpo do erro do provedor não volta para o cliente: a resposta do
        // endpoint é sempre genérica para não revelar quais e-mails existem.
        this.logger.error(
          `Falha ao enviar e-mail para ${to}: HTTP ${response.status}`,
        );
      }
    } catch (error) {
      this.logger.error(`Erro de rede ao enviar e-mail para ${to}`, error);
    }
  }
}
