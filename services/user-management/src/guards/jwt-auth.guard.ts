import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload = this.jwtService.verify(token);

      // Validate session
      const session = await this.sessionRepository.findOne({
        where: { id: payload.sessionId, isActive: true },
        relations: ['user', 'user.roles', 'user.roles.permissions'],
      });

      if (!session || !session.isValid) {
        throw new UnauthorizedException('Invalid session');
      }

      // Validate user
      const user = session.user;
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('User account is not active');
      }

      // Attach user and session to request
      request.user = user;
      request.sessionId = session.id;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers?.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
