import { NestFactory } from '@nestjs/core'; import { configureHttpApp } from '@app/common'; import { AppModule } from './app.module';
async function bootstrap(){const app=await NestFactory.create(AppModule);configureHttpApp(app,'User Management Service');await app.listen(process.env.PORT??3001,'0.0.0.0');} bootstrap();
