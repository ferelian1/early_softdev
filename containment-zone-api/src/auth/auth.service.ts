import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminUser, AdminUserDocument } from './schemas/admin-user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async login(password: string): Promise<{ access_token: string }> {
    const admin = await this.adminUserModel.findOne({ username: 'admin' }).exec();

    if (!admin) {
      throw new UnauthorizedException('ACCESS DENIED — SEAL REJECTED');
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('ACCESS DENIED — SEAL REJECTED');
    }

    // Update last login timestamp
    await this.adminUserModel.updateOne(
      { username: 'admin' },
      { $set: { last_login_at: new Date() } },
    );

    const payload = {
      sub: (admin._id as unknown as { toString(): string }).toString(),
      username: admin.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
