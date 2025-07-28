// modules/security/security.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

class EncryptDto {
  text: string;
}

class DecryptDto {
  encryptedData: string;
}

class HashDto {
  data: string;
}

class VerifyHashDto {
  data: string;
  hash: string;
}

@ApiTags('security')
@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('encrypt')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encrypt sensitive data' })
  @ApiResponse({ status: 200, description: 'Data encrypted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  encrypt(@Body() encryptDto: EncryptDto) {
    try {
      const encrypted = this.securityService.encrypt(encryptDto.text);
      return {
        success: true,
        encryptedData: encrypted,
      };
    } catch (error) {
      throw new BadRequestException('Failed to encrypt data');
    }
  }

  @Post('decrypt')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decrypt sensitive data' })
  @ApiResponse({ status: 200, description: 'Data decrypted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  decrypt(@Body() decryptDto: DecryptDto) {
    try {
      const decrypted = this.securityService.decrypt(decryptDto.encryptedData);
      return {
        success: true,
        decryptedData: decrypted,
      };
    } catch (error) {
      throw new BadRequestException('Failed to decrypt data');
    }
  }

  @Get('generate-token')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Generate a secure random token' })
  @ApiResponse({ status: 200, description: 'Token generated successfully' })
  generateToken() {
    const token = this.securityService.generateSecureToken();
    return {
      success: true,
      token,
    };
  }

  @Post('hash')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hash data using SHA-256' })
  @ApiResponse({ status: 200, description: 'Data hashed successfully' })
  hashData(@Body() hashDto: HashDto) {
    const hash = this.securityService.hashData(hashDto.data);
    return {
      success: true,
      hash,
    };
  }

  @Post('verify-hash')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify data against hash' })
  @ApiResponse({ status: 200, description: 'Hash verification completed' })
  verifyHash(@Body() verifyHashDto: VerifyHashDto) {
    const isValid = this.securityService.verifyHash(
      verifyHashDto.data,
      verifyHashDto.hash,
    );
    return {
      success: true,
      isValid,
    };
  }

  @Get('audit-log')
  @Roles('admin')
  @ApiOperation({ summary: 'Get security audit log' })
  @ApiResponse({ status: 200, description: 'Audit log retrieved successfully' })
  async getAuditLog(@Request() req) {
    // Placeholder for audit log retrieval
    // In a real implementation, this would fetch from a database
    return {
      success: true,
      message: 'Audit log feature to be implemented',
      user: req.user,
    };
  }
}
