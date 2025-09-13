import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @MaxLength(255, { message: '이메일은 255자를 초과할 수 없습니다.' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(1, { message: '비밀번호를 입력해주세요.' })
  @MaxLength(255, { message: '비밀번호는 255자를 초과할 수 없습니다.' })
  password: string;
}