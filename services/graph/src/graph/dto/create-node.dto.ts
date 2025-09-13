import { IsString, IsEnum, IsOptional, IsArray, IsObject, MaxLength, MinLength } from 'class-validator';
import { NodeType, ContentType } from '../../types/semantic-types';

export class CreateNodeDto {
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MinLength(1, { message: '제목은 최소 1글자 이상이어야 합니다.' })
  @MaxLength(500, { message: '제목은 500글자를 초과할 수 없습니다.' })
  title: string;

  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @MinLength(1, { message: '내용은 최소 1글자 이상이어야 합니다.' })
  content: string;

  @IsEnum(ContentType, { message: '유효한 콘텐츠 타입을 선택해주세요.' })
  @IsOptional()
  contentType?: ContentType = ContentType.TEXT;

  @IsEnum(NodeType, { message: '유효한 노드 타입을 선택해주세요.' })
  @IsOptional()
  nodeType?: NodeType = NodeType.KNOWLEDGE;

  @IsObject({ message: '메타데이터는 객체여야 합니다.' })
  @IsOptional()
  metadata?: Record<string, any> = {};

  @IsArray({ message: '태그는 배열이어야 합니다.' })
  @IsString({ each: true, message: '모든 태그는 문자열이어야 합니다.' })
  @IsOptional()
  tags?: string[] = [];
}