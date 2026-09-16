/**
 * Quantos dias para trás uma sessão pode ser registrada. Sem limite, uma sequência
 * poderia ser fabricada registrando uma sessão por dia num trecho arbitrário do passado.
 *
 * Fica num arquivo próprio porque o DTO (validação da requisição) e o service (regra
 * de negócio) precisam do mesmo número, e o DTO importar o service criaria um ciclo.
 */
export const MAX_BACKDATE_DAYS = 3;

/** 12 h de estudo registrado num dia já é generoso; além disso é fabricação de XP. */
export const MAX_DAILY_MINUTES = 720;

/** 1 XP por minuto — calculado no servidor, nunca aceito do cliente. */
export const XP_PER_MINUTE = 1;
