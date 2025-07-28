// modules/organizations/organizations.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { Organization } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';
import { Tender } from '../../entities/tender.entity';
import { Bid } from '../../entities/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, User, Tender, Bid])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
