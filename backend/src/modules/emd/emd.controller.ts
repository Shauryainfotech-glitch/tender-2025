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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EmdService } from './emd.service';
import { CreateEmdDto } from './dto/create-emd.dto';
import { UpdateEmdDto } from './dto/update-emd.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EmdStatus } from './entities/emd.entity';

@Controller('api/emds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmdController {
  constructor(private readonly emdService: EmdService) {}

  @Post()
  @Roles(Role.VENDOR, Role.SUPPLIER)
  @UseInterceptors(FilesInterceptor('documents', 5))
  create(
    @Body() createEmdDto: CreateEmdDto,
    @CurrentUser() user: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.emdService.create(createEmdDto, user.id, files);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: EmdStatus,
    @Query('tenderId') tenderId?: string,
    @Query('vendorId') vendorId?: string,
  ) {
    return this.emdService.findAll({
      page,
      limit,
      status,
      tenderId,
      vendorId,
    });
  }

  @Get('my-emds')
  @Roles(Role.VENDOR, Role.SUPPLIER)
  getMyEmds(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.emdService.findByVendor(user.id, { page, limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emdService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.BUYER)
  update(
    @Param('id') id: string,
    @Body() updateEmdDto: UpdateEmdDto,
    @CurrentUser() user: any,
  ) {
    return this.emdService.update(id, updateEmdDto, user.id);
  }

  @Post(':id/verify')
  @Roles(Role.ADMIN, Role.BUYER)
  verify(
    @Param('id') id: string,
    @Body('remarks') remarks: string,
    @CurrentUser() user: any,
  ) {
    return this.emdService.verify(id, user.id, remarks);
  }

  @Post(':id/refund')
  @Roles(Role.ADMIN, Role.BUYER)
  refund(
    @Param('id') id: string,
    @Body() data: {
      reason: string;
      transactionId?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.emdService.refund(id, data.reason, data.transactionId, user.id);
  }

  @Post(':id/forfeit')
  @Roles(Role.ADMIN, Role.BUYER)
  forfeit(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.emdService.forfeit(id, reason, user.id);
  }

  @Get('tender/:tenderId')
  getByTender(
    @Param('tenderId') tenderId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.emdService.findByTender(tenderId, { page, limit });
  }

  @Get('tender/:tenderId/summary')
  getTenderEmdSummary(@Param('tenderId') tenderId: string) {
    return this.emdService.getTenderEmdSummary(tenderId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.emdService.remove(id);
  }
}