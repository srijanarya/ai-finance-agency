import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
} from '../dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.authService.register(registerDto, ipAddress);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
  ) {
    void req; // ipAddress is available if needed
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser() user: User, @Req() req: Request) {
    const sessionId = (req as any).sessionId; // Set by JWT guard
    return this.authService.logout(user.id, sessionId);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.authService.forgotPassword(forgotPasswordDto, ipAddress);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.authService.resetPassword(resetPasswordDto, ipAddress);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetUser() user: User,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.authService.changePassword(
      user.id,
      changePasswordDto,
      ipAddress,
    );
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.authService.verifyEmail(token, ipAddress);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmailPost(
    @Body(ValidationPipe) verifyEmailDto: VerifyEmailDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.authService.verifyEmail(verifyEmailDto.token, ipAddress);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification() {
    // TODO: Implement resend verification logic
    return { message: 'Verification email sent' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser() user: User) {
    return { user };
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async checkAuth(@GetUser() user: User) {
    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles?.map((role) => role.name) || [],
      },
    };
  }

  // MFA Endpoints
  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async setupMfa(@GetUser() user: User) {
    return this.authService.setupMfa(user.id);
  }

  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async enableMfa(
    @GetUser() user: User,
    @Body('token') token: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.authService.enableMfa(user.id, token, ipAddress);
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async disableMfa(
    @GetUser() user: User,
    @Body('token') token: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.authService.disableMfa(user.id, token, ipAddress);
  }

  @Post('mfa/complete')
  @HttpCode(HttpStatus.OK)
  async completeMfaLogin(
    @Body('mfaToken') mfaToken: string,
    @Body('totpToken') totpToken: string,
    @Req() req: Request,
  ) {
    const deviceInfo = {
      deviceId: req.get('X-Device-ID') || 'unknown',
      deviceName: req.get('X-Device-Name'),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    };
    return this.authService.completeMfaLogin(mfaToken, totpToken, deviceInfo);
  }

  // Session Management Endpoints
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getUserSessions(@GetUser() user: User) {
    return this.authService.getAllUserSessions(user.id);
  }

  @Post('sessions/terminate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async terminateSession(
    @GetUser() user: User,
    @Body('sessionId') sessionId: string,
    @Req() req: Request,
  ) {
    const currentSessionId = (req as any).sessionId;
    return this.authService.terminateSession(user.id, sessionId, currentSessionId);
  }

  @Post('sessions/terminate-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async terminateAllOtherSessions(
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const currentSessionId = (req as any).sessionId;
    return this.authService.terminateAllOtherSessions(user.id, currentSessionId);
  }

  @Post('logout-enhanced')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async enhancedLogout(@GetUser() user: User, @Req() req: Request) {
    const sessionId = (req as any).sessionId;
    const token = req.get('Authorization')?.replace('Bearer ', '') || '';
    return this.authService.enhancedLogout(user.id, sessionId, token);
  }
}
