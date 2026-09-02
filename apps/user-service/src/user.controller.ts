import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Public, Roles, RolesGuard } from '@app/common';
import { AssignRoleDto, LoginDto, RefreshDto, RegisterDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';

@ApiTags('users') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller()
export class UserController {
  constructor(private readonly service: UserService) {}
  @Public() @Post('auth/register') register(@Body() dto:RegisterDto){ return this.service.register(dto); }
  @Public() @HttpCode(200) @Post('auth/login') login(@Body() dto:LoginDto){ return this.service.login(dto.identity,dto.password); }
  @Public() @HttpCode(200) @Post('auth/refresh') refresh(@Body() dto:RefreshDto){ return this.service.refresh(dto.refresh_token); }
  @Get('users/:id') get(@Param('id') id:string){ return this.service.findOne(id); }
  @Put('users/:id') update(@Param('id') id:string,@Body() dto:UpdateUserDto){ return this.service.update(id,dto); }
  @Roles('ADMIN') @Post('users/:id/roles') assignRole(@Param('id') id:string,@Body() dto:AssignRoleDto){ return this.service.assignRole(id,dto.role); }
  @Roles('ADMIN') @HttpCode(HttpStatus.NO_CONTENT) @Delete('users/:id') remove(@Param('id') id:string){ return this.service.remove(id); }
  @Public() @Get('health') health(){ return {status:'ok',service:'user-service'}; }
}
