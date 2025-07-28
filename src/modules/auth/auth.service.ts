// modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, userAgent?: string, ipAddress?: string) {
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
      organizationId: user.organizationId
    };
    
    // Log login activity
    if (ipAddress || userAgent) {
      await this.updateLastLogin(user.id, ipAddress, userAgent);
    }
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        organizationId: user.organizationId,
      },
    };
  }

  async createRefreshToken(userId: string): Promise<RefreshToken> {
    const refreshToken = this.refreshTokenRepository.create({
      token: uuidv4(),
      userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return await this.refreshTokenRepository.save(refreshToken);
  }

  async refreshToken(token: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token, isRevoked: false },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = refreshToken.user;
    const payload = { 
      email: user.email, 
      sub: user.id, 
      roles: user.roles,
      organizationId: user.organizationId 
    };

    // Revoke old refresh token
    refreshToken.isRevoked = true;
    await this.refreshTokenRepository.save(refreshToken);

    // Create new refresh token
    const newRefreshToken = await this.createRefreshToken(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: newRefreshToken.token,
    };
  }

  async logout(userId: string, refreshToken?: string) {
    // Revoke the specific refresh token or all tokens
    if (refreshToken) {
      await this.refreshTokenRepository.update(
        { token: refreshToken, userId, isRevoked: false },
        { isRevoked: true }
      );
    } else {
      await this.refreshTokenRepository.update(
        { userId, isRevoked: false },
        { isRevoked: true }
      );
    }

    return { message: 'Logged out successfully' };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const { password, ...result } = user;
    return {
      message: 'User registered successfully',
      user: result,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpiry,
    });

    // TODO: Send email with reset link
    // In a real implementation, you would send an email here
    // with a link like: https://yourapp.com/reset-password?token=${resetToken}
    
    return { message: 'Password reset link sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.emailVerified) {
      return { message: 'Verification email sent if applicable' };
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.userRepository.update(user.id, {
      emailVerificationToken: verificationToken,
    });

    // TODO: Send verification email
    // In a real implementation, you would send an email here

    return { message: 'Verification email sent' };
  }

  async checkEmailExists(email: string) {
    const user = await this.usersService.findByEmail(email);
    return { exists: !!user };
  }

  async validateResetToken(token: string) {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return { valid: false };
    }

    return { valid: true, email: user.email };
  }

  async getUserSessions(userId: string) {
    const refreshTokens = await this.refreshTokenRepository.find({
      where: { userId, isRevoked: false },
      order: { createdAt: 'DESC' },
    });

    return refreshTokens.map(token => ({
      id: token.id,
      isCurrentSession: false, // Would need request context to determine this
      lastActivity: token.updatedAt || token.createdAt,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const result = await this.refreshTokenRepository.update(
      { id: sessionId, userId },
      { isRevoked: true }
    );

    if (result.affected === 0) {
      throw new NotFoundException('Session not found');
    }

    return { message: 'Session revoked successfully' };
  }

  async revokeAllSessions(userId: string, currentToken?: string) {
    // Revoke all sessions except the current one if provided
    const query = this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ isRevoked: true })
      .where('userId = :userId', { userId })
      .andWhere('isRevoked = :isRevoked', { isRevoked: false });

    if (currentToken) {
      query.andWhere('token != :currentToken', { currentToken });
    }

    await query.execute();

    return { message: 'All sessions revoked successfully' };
  }

  async updateLastLogin(userId: string, ipAddress?: string, userAgent?: string) {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
      lastUserAgent: userAgent,
    });
  }
}
