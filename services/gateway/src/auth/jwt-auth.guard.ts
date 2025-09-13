import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // 공개 엔드포인트는 인증 불필요
    const publicEndpoints = [
      '/api/auth/login',
      '/api/auth/register',
      '/health',
      '/api/docs',
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      request.url.startsWith(endpoint)
    );

    if (isPublicEndpoint) {
      this.logger.log(`Public endpoint accessed: ${request.url}`);
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    if (err || !user) {
      this.logger.error(`JWT authentication failed for ${request.url}:`, {
        error: err?.message,
        info: info?.message,
      });
      
      throw new UnauthorizedException({
        error: 'Authentication Failed',
        message: 'Valid JWT token required',
        statusCode: 401,
      });
    }

    this.logger.log(`User ${user.email} authenticated for ${request.url}`);
    return user;
  }
}