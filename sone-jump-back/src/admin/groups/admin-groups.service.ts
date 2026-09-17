import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FullListQueryDto } from '../../common/pagination/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

/**
 * Administração dos grupos da comunidade.
 *
 * Até aqui os grupos só existiam pelo seed: criar um novo exigia rodar o seed de novo
 * contra o banco de produção. Com o feed por grupo no ar, isso virou um limite real
 * do produto.
 */
@Injectable()
export class AdminGroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(query: FullListQueryDto) {
    const groups = await this.prisma.group.findMany({
      include: { _count: { select: { members: true, posts: true } } },
      orderBy: { name: 'asc' },
      take: query.limit,
      skip: query.offset,
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      icon: group.icon,
      membersCount: group._count.members,
      postsCount: group._count.posts,
    }));
  }

  async create(adminUserId: number, dto: CreateGroupDto) {
    await this.assertNameIsFree(dto.name);

    const group = await this.prisma.group.create({
      data: { name: dto.name, icon: dto.icon },
    });
    await this.auditLog.record(adminUserId, 'create_group', 'Group', group.id);
    return group;
  }

  async update(adminUserId: number, groupId: number, dto: UpdateGroupDto) {
    await this.assertExists(groupId);
    if (dto.name !== undefined) await this.assertNameIsFree(dto.name, groupId);

    const group = await this.prisma.group.update({
      where: { id: groupId },
      data: { name: dto.name, icon: dto.icon },
    });
    await this.auditLog.record(adminUserId, 'update_group', 'Group', group.id);
    return group;
  }

  /**
   * Apagar um grupo apaga em cascata as publicações feitas nele — conteúdo escrito
   * pelos alunos. Por isso a exclusão só passa com o grupo vazio: o admin decide
   * explicitamente o que fazer com as publicações antes, em vez de descobrir a perda
   * depois. Participantes não bloqueiam: sair do grupo não destrói nada.
   */
  async remove(adminUserId: number, groupId: number): Promise<void> {
    await this.assertExists(groupId);

    const posts = await this.prisma.post.count({ where: { groupId } });
    if (posts > 0)
      throw new ConflictException(
        `Grupo tem ${posts} publicação(ões) e não pode ser apagado. ` +
          'Remova as publicações antes.',
      );

    await this.prisma.group.delete({ where: { id: groupId } });
    await this.auditLog.record(adminUserId, 'delete_group', 'Group', groupId);
  }

  private async assertExists(groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado.');
    return group;
  }

  /** `name` é único no schema; a checagem aqui troca o erro do banco por 409 com texto. */
  private async assertNameIsFree(name: string, exceptGroupId?: number) {
    const existing = await this.prisma.group.findUnique({ where: { name } });
    if (existing && existing.id !== exceptGroupId)
      throw new ConflictException('Já existe um grupo com esse nome.');
  }
}
