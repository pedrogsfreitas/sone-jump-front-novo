import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** Every 500 XP = one level. Arbitrary but consistent across every place that awards XP. */
export function calculateLevel(xpTotal: number): number {
  return Math.floor(xpTotal / 500) + 1;
}

@Injectable()
export class XpService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * `increment` vira um `UPDATE ... SET "xpTotal" = "xpTotal" + n` executado pelo
   * banco, então duas concessões simultâneas somam as duas. A versão anterior lia o
   * total, somava em memória e reescrevia — com duas requisições concorrentes (concluir
   * uma etapa e um desafio ao mesmo tempo, por exemplo) a segunda sobrescrevia a
   * primeira e o XP sumia sem deixar rastro.
   *
   * `level` é derivado do total, então só pode ser calculado depois de saber o valor
   * final — daí o segundo update. Ele é condicional porque na maioria das concessões o
   * nível não muda, e é seguro correr em paralelo: qualquer ordem converge para o mesmo
   * nível, e uma concessão seguinte corrigiria um valor eventualmente atrasado.
   */
  async award(userId: number, amount: number): Promise<void> {
    if (amount <= 0) return;
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { xpTotal: { increment: amount } },
      select: { xpTotal: true, level: true },
    });

    const level = calculateLevel(user.xpTotal);
    if (level !== user.level) {
      await this.prisma.user.update({ where: { id: userId }, data: { level } });
    }
  }
}
