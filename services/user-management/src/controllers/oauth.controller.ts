import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class OAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // Google OAuth Routes
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const profile = req.user as any;
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const authResult = await this.authService.handleOAuthCallback(
        'google',
        profile,
        ipAddress,
      );

      const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
      const redirectUrl = `${frontendUrl}/auth/callback?token=${authResult.accessToken}&refresh=${authResult.refreshToken}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  // GitHub OAuth Routes
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Initiates GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const profile = req.user as any;
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const authResult = await this.authService.handleOAuthCallback(
        'github',
        profile,
        ipAddress,
      );

      const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
      const redirectUrl = `${frontendUrl}/auth/callback?token=${authResult.accessToken}&refresh=${authResult.refreshToken}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  // Link existing account with OAuth provider
  @Post('link/google')
  @UseGuards(AuthGuard('google'))
  @HttpCode(HttpStatus.OK)
  async linkGoogleAccount(@Req() req: Request) {
    // TODO: Implement account linking logic
    return { message: 'Google account linked successfully' };
  }

  @Post('link/github')
  @UseGuards(AuthGuard('github'))
  @HttpCode(HttpStatus.OK)
  async linkGitHubAccount(@Req() req: Request) {
    // TODO: Implement account linking logic
    return { message: 'GitHub account linked successfully' };
  }

  // Unlink OAuth provider
  @Post('unlink/google')
  @HttpCode(HttpStatus.OK)
  async unlinkGoogleAccount(@Req() req: Request) {
    // TODO: Implement account unlinking logic
    return { message: 'Google account unlinked successfully' };
  }

  @Post('unlink/github')
  @HttpCode(HttpStatus.OK)
  async unlinkGitHubAccount(@Req() req: Request) {
    // TODO: Implement account unlinking logic
    return { message: 'GitHub account unlinked successfully' };
  }
}