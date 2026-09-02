import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { RegisterDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>, private readonly jwt: JwtService) {}
  private safe(user: User) { const { passwordHash, ...result } = user; return result; }
  private tokens(user: User) {
    const payload = { sub: user.id, username: user.username, roles: user.roles };
    return { access_token: this.jwt.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '1h' }), refresh_token: this.jwt.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' }), token_type: 'Bearer', expires_in: 3600 };
  }
  async register(dto: RegisterDto) {
    if (await this.users.findOne({ where: [{ email: dto.email }, { username: dto.username }] })) throw new ConflictException('Email or username already exists');
    const user = await this.users.save(this.users.create({ email: dto.email.toLowerCase(), username: dto.username, displayName: dto.display_name, passwordHash: await bcrypt.hash(dto.password, 12), roles: ['BUYER'], status: 'ACTIVE' }));
    return { user: this.safe(user), ...this.tokens(user) };
  }
  async login(identity: string, password: string) {
    const user = await this.users.findOne({ where: [{ email: identity.toLowerCase() }, { username: identity }] });
    if (!user || user.status !== 'ACTIVE' || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException('Invalid credentials');
    return { user: this.safe(user), ...this.tokens(user) };
  }
  async refresh(token: string) {
    try { const payload = this.jwt.verify(token, { secret: process.env.JWT_REFRESH_SECRET }); const user = await this.users.findOneByOrFail({ id: payload.sub }); return this.tokens(user); }
    catch { throw new UnauthorizedException('Invalid or expired refresh token'); }
  }
  async findOne(id: string) { const user = await this.users.findOneBy({ id }); if (!user) throw new NotFoundException('User not found'); return this.safe(user); }
  async update(id: string, dto: UpdateUserDto) { const user = await this.users.findOneBy({ id }); if (!user) throw new NotFoundException('User not found'); if (dto.password) user.passwordHash = await bcrypt.hash(dto.password, 12); if (dto.display_name !== undefined) user.displayName=dto.display_name; if (dto.status) user.status=dto.status; return this.safe(await this.users.save(user)); }
  async assignRole(id: string, role: string) { const user=await this.users.findOneBy({id}); if(!user) throw new NotFoundException('User not found'); user.roles=[...new Set([...user.roles,role])]; return this.safe(await this.users.save(user)); }
  async remove(id: string) { const result=await this.users.delete(id); if(!result.affected) throw new NotFoundException('User not found'); }
}
