// modules/tenders/tenders.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  Query 
} from '@nestjs/common';
import { TendersService } from './tenders.service';
import { CreateTenderDto } from './dto/create-tender.dto';
import { UpdateTenderDto } from './dto/update-tender.dto';
import { SearchTenderDto } from './dto/search-tender.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/guards/roles.guard';

@Controller('tenders')
@UseGuards(JwtAuthGuard)
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.BUYER)
  create(@Body() createTenderDto: CreateTenderDto, @Request() req) {
    return this.tendersService.create(createTenderDto, req.user.id);
  }

  @Get()
  findAll(@Query() searchDto: SearchTenderDto) {
    return this.tendersService.findAll(searchDto);
  }

  @Get('active')
  getActiveTenders() {
    return this.tendersService.getActiveTenders();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tendersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.BUYER)
  update(@Param('id') id: string, @Body() updateTenderDto: UpdateTenderDto) {
    return this.tendersService.update(id, updateTenderDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.tendersService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.BUYER)
  publishTender(@Param('id') id: string) {
    return this.tendersService.publishTender(id);
  }

  @Post(':id/close')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.BUYER)
  closeTender(@Param('id') id: string) {
    return this.tendersService.closeTender(id);
  }

  @Get('organization/:organizationId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getTendersByOrganization(@Param('organizationId') organizationId: string) {
    return this.tendersService.getTendersByOrganization(organizationId);
  }
}
