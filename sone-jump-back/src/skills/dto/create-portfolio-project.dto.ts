import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreatePortfolioProjectDto {
  @IsString()
  @Length(2, 120)
  title: string;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  stackTags: string[];

  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @IsOptional()
  @IsUrl()
  demoUrl?: string;
}
