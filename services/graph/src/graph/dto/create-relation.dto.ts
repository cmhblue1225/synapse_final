import { IsString, IsEnum, IsNumber, IsOptional, IsObject, Min, Max, IsUUID } from 'class-validator';
import { SemanticRelationType } from '../../types/semantic-types';

export class CreateRelationDto {
  @IsUUID(4, { message: '시작 노드 ID는 유효한 UUID여야 합니다.' })
  fromNodeId: string;

  @IsUUID(4, { message: '대상 노드 ID는 유효한 UUID여야 합니다.' })
  toNodeId: string;

  @IsEnum(SemanticRelationType, { message: '유효한 관계 타입을 선택해주세요.' })
  relationType: SemanticRelationType;

  @IsNumber({}, { message: '강도는 숫자여야 합니다.' })
  @Min(0, { message: '강도는 0 이상이어야 합니다.' })
  @Max(1, { message: '강도는 1 이하여야 합니다.' })
  @IsOptional()
  strength?: number = 0.5;

  @IsNumber({}, { message: '확신도는 숫자여야 합니다.' })
  @Min(0, { message: '확신도는 0 이상이어야 합니다.' })
  @Max(1, { message: '확신도는 1 이하여야 합니다.' })
  @IsOptional()
  confidence?: number = 0.8;

  @IsObject({ message: '메타데이터는 객체여야 합니다.' })
  @IsOptional()
  metadata?: Record<string, any> = {};
}