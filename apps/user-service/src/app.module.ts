import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard, RolesGuard } from '@app/common';
import { User } from './user.entity'; import { UserController } from './user.controller'; import { UserService } from './user.service';
@Module({ imports:[ConfigModule.forRoot({isGlobal:true}),JwtModule.register({}),TypeOrmModule.forRoot({type:'mysql',host:process.env.MYSQL_HOST??'mysql-users',port:3306,username:process.env.MYSQL_USER??'ecommerce',password:process.env.MYSQL_PASSWORD??'ecommerce_password',database:process.env.MYSQL_DATABASE??'users',entities:[User],synchronize:process.env.DB_SYNCHRONIZE==='true'}),TypeOrmModule.forFeature([User])],controllers:[UserController],providers:[UserService,JwtAuthGuard,RolesGuard] }) export class AppModule{}
