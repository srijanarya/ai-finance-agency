import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get('GITHUB_CALLBACK_URL', '/auth/github/callback'),
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    try {
      const { id, emails, displayName, username } = profile;
      
      const user = {
        githubId: id,
        email: emails?.[0]?.value,
        firstName: displayName?.split(' ')[0] || username,
        lastName: displayName?.split(' ').slice(1).join(' ') || '',
        username,
        displayName,
        accessToken,
        refreshToken,
      };

      return user;
    } catch (error) {
      throw error;
    }
  }
}