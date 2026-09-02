import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(3) username: string;
  @ApiProperty() @IsStrongPassword({ minLength: 8, minNumbers: 1, minUppercase: 1, minSymbols: 0 }) password: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() display_name?: string;
}
export class LoginDto { @IsString() identity: string; @IsString() password: string; }
export class RefreshDto { @IsString() refresh_token: string; }
export class UpdateUserDto extends PartialType(RegisterDto) { @IsOptional() @IsIn(['ACTIVE','INACTIVE','BANNED']) status?: 'ACTIVE'|'INACTIVE'|'BANNED'; }
export class AssignRoleDto { @IsIn(['BUYER','SELLER','ADMIN']) role: string; }
