import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(username: string, email: string, password: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new UnauthorizedException(
        existingUser.email === email ? '邮箱已被注册' : '用户名已被使用',
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
      include: {
        profile: true,
      },
    });

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      token,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return { user };
  }

  async updateProfile(userId: string, displayName: string, bio: string) {
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      create: { userId, displayName, bio },
      update: { displayName, bio },
    });

    return { message: '个人资料更新成功', profile };
  }

  private generateToken(userId: string, email: string, role: string) {
    return this.jwtService.sign({ userId, email, role });
  }
}
