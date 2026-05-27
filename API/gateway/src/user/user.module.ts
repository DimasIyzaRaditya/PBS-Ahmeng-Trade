import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaUserService } from '../prisma-user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaUserService],
})
export class UserModule {}
