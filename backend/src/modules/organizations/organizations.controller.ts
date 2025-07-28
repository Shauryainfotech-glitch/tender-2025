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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.organizationsService.findAll({
      page,
      limit,
      search,
      type,
      status,
    });
  }

  @Get('my-organization')
  getMyOrganization(@CurrentUser() user: any) {
    return this.organizationsService.findOne(user.organizationId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.BUYER)
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }

  @Post(':id/activate')
  @Roles(Role.ADMIN)
  activate(@Param('id') id: string) {
    return this.organizationsService.updateStatus(id, 'active');
  }

  @Post(':id/deactivate')
  @Roles(Role.ADMIN)
  deactivate(@Param('id') id: string) {
    return this.organizationsService.updateStatus(id, 'inactive');
  }

  @Get(':id/users')
  @Roles(Role.ADMIN, Role.BUYER)
  getOrganizationUsers(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.organizationsService.getOrganizationUsers(id, { page, limit });
  }

  @Get(':id/tenders')
  @Roles(Role.ADMIN, Role.BUYER)
  getOrganizationTenders(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.organizationsService.getOrganizationTenders(id, { page, limit });
  }

  @Get(':id/statistics')
  @Roles(Role.ADMIN, Role.BUYER)
  getOrganizationStatistics(@Param('id') id: string) {
    return this.organizationsService.getOrganizationStatistics(id);
  }

  @Post(':id/settings')
  @Roles(Role.ADMIN, Role.BUYER)
  updateSettings(
    @Param('id') id: string,
    @Body() settings: any,
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.updateSettings(id, settings, user.id);
  }

  @Get(':id/settings')
  @Roles(Role.ADMIN, Role.BUYER)
  getSettings(@Param('id') id: string) {
    return this.organizationsService.getSettings(id);
  }
}