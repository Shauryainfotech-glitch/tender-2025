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
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BidStatus } from './entities/bid.entity';

@Controller('api/bids')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @Roles(Role.VENDOR, Role.SUPPLIER)
  @UseInterceptors(FilesInterceptor('documents', 10))
  create(
    @Body() createBidDto: CreateBidDto,
    @CurrentUser() user: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.bidsService.create(createBidDto, user.id, files);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('tenderId') tenderId?: string,
    @Query('status') status?: BidStatus,
  ) {
    return this.bidsService.findAll({
      page,
      limit,
      tenderId,
      status,
    });
  }

  @Get('my-bids')
  @Roles(Role.VENDOR, Role.SUPPLIER)
  getMyBids(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.bidsService.findByVendor(user.id, { page, limit });
  }

  @Get('tender/:tenderId')
  getBidsByTender(
    @Param('tenderId') tenderId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.bidsService.findByTender(tenderId, { page, limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bidsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.VENDOR, Role.SUPPLIER)
  @UseInterceptors(FilesInterceptor('documents', 10))
  update(
    @Param('id') id: string,
    @Body() updateBidDto: UpdateBidDto,
    @CurrentUser() user: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.bidsService.update(id, updateBidDto, user.id, files);
  }

  @Post(':id/submit')
  @Roles(Role.VENDOR, Role.SUPPLIER)
  submit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bidsService.submit(id, user.id);
  }

  @Post(':id/withdraw')
  @Roles(Role.VENDOR, Role.SUPPLIER)
  withdraw(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bidsService.withdraw(id, user.id);
  }

  @Post(':id/disqualify')
  @Roles(Role.BUYER, Role.ADMIN)
  disqualify(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.bidsService.disqualify(id, reason, user.id);
  }

  @Post(':id/shortlist')
  @Roles(Role.BUYER, Role.ADMIN)
  shortlist(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bidsService.shortlist(id, user.id);
  }

  @Delete(':id')
  @Roles(Role.VENDOR, Role.SUPPLIER)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bidsService.remove(id, user.id);
  }

  @Get(':id/compare')
  @Roles(Role.BUYER, Role.ADMIN)
  compareBids(@Param('id') tenderId: string) {
    return this.bidsService.compareBids(tenderId);
  }

  @Get(':id/analytics')
  @Roles(Role.VENDOR, Role.SUPPLIER)
  getBidAnalytics(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bidsService.getBidAnalytics(id, user.id);
  }
}