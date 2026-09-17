/**
 * Endereço oficial do JUMP. O `www` existe porque é o que muita gente digita por
 * hábito, mas o site tem um endereço só.
 */
export const CANONICAL_HOST = "jumpapi.com.br";

/**
 * Para onde `url` deve ser redirecionada, ou `null` quando já está no lugar certo.
 *
 * Isto não é cosmético: a API só autoriza a origem `https://jumpapi.com.br` no CORS.
 * Aberto pelo `www`, o site carrega igual e só o login falha — sintoma caro de
 * diagnosticar. Em vez de duplicar a origem na allowlist do back, o front leva quem
 * chegou pelo `www` para o endereço oficial.
 *
 * O redirect ideal seria 301 no servidor, mas o Static Web Apps não casa rota por
 * host: `staticwebapp.config.json` só enxerga o caminho. A alternativa seria o proxy
 * do Cloudflare, que quebraria a revalidação do domínio na Azure.
 */
export function canonicalUrlFor(url: URL): string | null {
  if (url.hostname !== `www.${CANONICAL_HOST}`) return null;

  const destino = new URL(url.toString());
  destino.hostname = CANONICAL_HOST;
  return destino.toString();
}

/**
 * Leva o navegador ao endereço oficial quando necessário. `replace` em vez de `assign`
 * para o botão "voltar" não devolver a pessoa ao `www` e criar um laço.
 */
export function redirectToCanonicalHost(
  location: Pick<Location, "href" | "replace">,
): boolean {
  const destino = canonicalUrlFor(new URL(location.href));
  if (!destino) return false;

  location.replace(destino);
  return true;
}
