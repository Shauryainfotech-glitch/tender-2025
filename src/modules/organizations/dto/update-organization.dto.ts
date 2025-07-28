// modules/organizations/dto/update-organization.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateOrganizationDto } from './create-organization.dto';

export class UpdateOrganizationDto extends PartialType(
  OmitType(CreateOrganizationDto, ['registrationNumber', 'type'] as const)
) {}
