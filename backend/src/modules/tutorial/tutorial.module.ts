import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TutorialController } from './tutorial.controller';
import { TutorialService } from './tutorial.service';

@Module({
  imports: [UserModule],
  controllers: [TutorialController],
  providers: [TutorialService],
  exports: [TutorialService],
})
export class TutorialModule {}
