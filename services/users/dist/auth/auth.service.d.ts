import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserResponse } from './interfaces/user-response.interface';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        user: UserResponse;
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: UserResponse;
        token: string;
    }>;
    validateUser(payload: JwtPayload): Promise<User>;
    getUserById(id: string): Promise<User>;
}
