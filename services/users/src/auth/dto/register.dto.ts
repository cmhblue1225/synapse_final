import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class RegisterDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @MaxLength(255, { message: '이메일은 255자를 초과할 수 없습니다.' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  @MaxLength(255, { message: '비밀번호는 255자를 초과할 수 없습니다.' })
  password: string;

  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '이름은 50자를 초과할 수 없습니다.' })
  firstName: string;

  @IsString({ message: '성은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '성은 50자를 초과할 수 없습니다.' })
  lastName: string;

  @IsOptional()
  @IsEnum(UserRole, { message: '유효한 사용자 역할을 선택해주세요.' })
  role?: UserRole;
}