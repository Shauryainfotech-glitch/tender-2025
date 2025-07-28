import { PartialType } from '@nestjs/swagger';
import { CreateEMDDto } from './create-emd.dto';

export class UpdateEMDDto extends PartialType(CreateEMDDto) {}
