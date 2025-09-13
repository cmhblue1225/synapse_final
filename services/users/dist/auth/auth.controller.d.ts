import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: import("./interfaces/user-response.interface").UserResponse;
            token: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: import("./interfaces/user-response.interface").UserResponse;
            token: string;
        };
    }>;
    getProfile(req: {
        user: User;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                email: string;
                role: import("../entities/user.entity").UserRole;
                firstName: string;
                lastName: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    validateToken(req: {
        user: User;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            valid: boolean;
            user: {
                id: string;
                email: string;
                role: import("../entities/user.entity").UserRole;
            };
        };
    }>;
}
