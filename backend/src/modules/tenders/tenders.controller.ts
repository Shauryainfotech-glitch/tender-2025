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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { TendersService } from './tenders.service';
import { CreateTenderDto } from './dto/create-tender.dto';
import { UpdateTenderDto } from './dto/update-tender.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TenderStatus } from './entities/tender.entity';

@Controller('api/tenders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Post()
  @Roles(Role.BUYER, Role.ADMIN)
  @UseInterceptors(FilesInterceptor('documents', 10))
  create(
    @Body() createTenderDto: CreateTenderDto,
    @CurrentUser() user: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.tendersService.create(createTenderDto, user.id, files);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: TenderStatus,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.tendersService.findAll({
      page,
      limit,
      status,
      category,
      search,
    });
  }

  @Get('my-tenders')
  @Roles(Role.BUYER, Role.ADMIN)
  getMyTenders(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.tendersService.findByUser(user.id, { page, limit });
  }

  @Get('organization/:organizationId')
  @Roles(Role.ADMIN)
  findByOrganization(
    @Param('organizationId') organizationId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.tendersService.findByOrganization(organizationId, { page, limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tendersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.BUYER, Role.ADMIN)
  @UseInterceptors(FilesInterceptor('documents', 10))
  update(
    @Param('id') id: string,
    @Body() updateTenderDto: UpdateTenderDto,
    @CurrentUser() user: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.tendersService.update(id, updateTenderDto, user.id, files);
  }

  @Post(':id/publish')
  @Roles(Role.BUYER, Role.ADMIN)
  publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tendersService.publish(id, user.id);
  }

  @Post(':id/close')
  @Roles(Role.BUYER, Role.ADMIN)
  close(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tendersService.close(id, user.id);
  }

  @Post(':id/cancel')
  @Roles(Role.BUYER, Role.ADMIN)
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tendersService.cancel(id, user.id);
  }

  @Post(':id/extend')
  @Roles(Role.BUYER, Role.ADMIN)
  extend(
    @Param('id') id: string,
    @Body('newDeadline') newDeadline: Date,
    @CurrentUser() user: any,
  ) {
    return this.tendersService.extend(id, newDeadline, user.id);
  }

  @Delete(':id')
  @Roles(Role.BUYER, Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tendersService.remove(id, user.id);
  }

  @Post(':id/favorite')
  @Roles(Role.VENDOR, Role.SUPPLIER)
  addToFavorites(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tendersService.addToFavorites(id, user.id);
  }

  @Delete(':id/favorite')
  @Roles(Role.VENDOR, Role.SUPPLIER)
  removeFromFavorites(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tendersService.removeFromFavorites(id, user.id);
  }

  @Get(':id/analytics')
  @Roles(Role.BUYER, Role.ADMIN)
  getAnalytics(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tendersService.getAnalytics(id, user.id);
  }
}