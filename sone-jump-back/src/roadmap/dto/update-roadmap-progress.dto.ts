import { IsIn } from 'class-validator';

export class UpdateRoadmapProgressDto {
  @IsIn(['IN_PROGRESS', 'COMPLETED'])
  status: 'IN_PROGRESS' | 'COMPLETED';
}
