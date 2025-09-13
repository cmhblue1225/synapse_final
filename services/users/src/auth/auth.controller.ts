import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      message: '회원가입이 성공적으로 완료되었습니다.',
      data: result,
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      message: '로그인이 성공적으로 완료되었습니다.',
      data: result,
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req: { user: User }) {
    const { password, ...userWithoutPassword } = req.user;
    return {
      success: true,
      message: '프로필 조회가 성공적으로 완료되었습니다.',
      data: { user: userWithoutPassword },
    };
  }

  @Get('validate')
  @UseGuards(AuthGuard('jwt'))
  async validateToken(@Request() req: { user: User }) {
    return {
      success: true,
      message: '토큰이 유효합니다.',
      data: {
        valid: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
        },
      },
    };
  }
}