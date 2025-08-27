import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { Organization } from './organization.entity';
import { Membership } from './membership.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  async register(email: string, password: string, firstName?: string, lastName?: string) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
    });

    const savedUser = await this.userRepository.save(user);

    // Create default organization
    const org = this.orgRepository.create({
      name: `${firstName || 'My'}'s Organization`,
      slug: `org-${Date.now()}`,
    });

    const savedOrg = await this.orgRepository.save(org);

    // Create membership
    await this.membershipRepository.save({
      user_id: savedUser.id,
      org_id: savedOrg.id,
      role: 'owner',
      permissions: ['*'],
    });

    return this.login(savedUser);
  }

  async getUserOrgs(userId: string) {
    return this.membershipRepository.find({
      where: { user_id: userId },
      relations: ['organization'],
    });
  }
}
