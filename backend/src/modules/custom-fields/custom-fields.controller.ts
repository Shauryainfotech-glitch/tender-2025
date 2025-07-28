import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CustomFieldEntity } from './entities/custom-field.entity';

@Controller('api/custom-fields')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body() createCustomFieldDto: CreateCustomFieldDto,
    @CurrentUser() user: any,
  ) {
    return this.customFieldsService.create(
      createCustomFieldDto,
      user.organizationId,
    );
  }

  @Get()
  findAll(
    @Query('entityType') entityType?: CustomFieldEntity,
    @Query('active') active?: string,
    @CurrentUser() user?: any,
  ) {
    return this.customFieldsService.findAll({
      entityType,
      isActive: active === 'true',
      organizationId: user?.organizationId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customFieldsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCustomFieldDto: UpdateCustomFieldDto,
  ) {
    return this.customFieldsService.update(id, updateCustomFieldDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.customFieldsService.remove(id);
  }

  @Post(':id/reorder')
  @Roles(Role.ADMIN)
  reorder(
    @Param('id') id: string,
    @Body('order') order: number,
  ) {
    return this.customFieldsService.reorder(id, order);
  }

  @Get('entity/:entityType')
  getFieldsByEntity(
    @Param('entityType') entityType: CustomFieldEntity,
    @CurrentUser() user: any,
  ) {
    return this.customFieldsService.getFieldsByEntity(
      entityType,
      user.organizationId,
    );
  }

  @Post('validate')
  validateFieldValue(
    @Body() data: {
      fieldId: string;
      value: any;
    },
  ) {
    return this.customFieldsService.validateFieldValue(
      data.fieldId,
      data.value,
    );
  }
}