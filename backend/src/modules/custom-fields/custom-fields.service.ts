import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomField, CustomFieldEntity } from './entities/custom-field.entity';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';

@Injectable()
export class CustomFieldsService {
  constructor(
    @InjectRepository(CustomField)
    private readonly customFieldRepository: Repository<CustomField>,
  ) {}

  async create(
    createCustomFieldDto: CreateCustomFieldDto,
    organizationId: string,
  ): Promise<CustomField> {
    // Generate field key from name
    const fieldKey = this.generateFieldKey(
      createCustomFieldDto.name,
      createCustomFieldDto.entityType,
      organizationId,
    );

    // Check if field key already exists
    const existing = await this.customFieldRepository.findOne({
      where: { fieldKey },
    });

    if (existing) {
      throw new BadRequestException('Field with this name already exists');
    }

    const customField = this.customFieldRepository.create({
      ...createCustomFieldDto,
      fieldKey,
      organizationId,
    });

    return this.customFieldRepository.save(customField);
  }

  async findAll(filters: {
    entityType?: CustomFieldEntity;
    isActive?: boolean;
    organizationId?: string;
  }): Promise<CustomField[]> {
    const query = this.customFieldRepository.createQueryBuilder('field');

    if (filters.entityType) {
      query.andWhere('field.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('field.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.organizationId) {
      query.andWhere('field.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });
    }

    return query.orderBy('field.displayOrder', 'ASC').getMany();
  }

  async findOne(id: string): Promise<CustomField> {
    const customField = await this.customFieldRepository.findOne({
      where: { id },
    });

    if (!customField) {
      throw new NotFoundException('Custom field not found');
    }

    return customField;
  }

  async update(
    id: string,
    updateCustomFieldDto: UpdateCustomFieldDto,
  ): Promise<CustomField> {
    const customField = await this.findOne(id);

    // Don't allow changing field key or entity type
    const { fieldKey, entityType, ...updateData } = updateCustomFieldDto as any;

    Object.assign(customField, updateData);

    return this.customFieldRepository.save(customField);
  }

  async remove(id: string): Promise<void> {
    const customField = await this.findOne(id);
    await this.customFieldRepository.remove(customField);
  }

  async reorder(id: string, newOrder: number): Promise<CustomField> {
    const customField = await this.findOne(id);

    // Get all fields for the same entity type and organization
    const fields = await this.customFieldRepository.find({
      where: {
        entityType: customField.entityType,
        organizationId: customField.organizationId,
      },
      order: { displayOrder: 'ASC' },
    });

    // Remove the field from its current position
    const currentIndex = fields.findIndex(f => f.id === id);
    fields.splice(currentIndex, 1);

    // Insert at new position
    fields.splice(newOrder, 0, customField);

    // Update display order for all fields
    const updates = fields.map((field, index) => ({
      ...field,
      displayOrder: index,
    }));

    await this.customFieldRepository.save(updates);

    customField.displayOrder = newOrder;
    return customField;
  }

  async getFieldsByEntity(
    entityType: CustomFieldEntity,
    organizationId: string,
  ): Promise<CustomField[]> {
    return this.customFieldRepository.find({
      where: {
        entityType,
        organizationId,
        isActive: true,
      },
      order: { displayOrder: 'ASC' },
    });
  }

  async validateFieldValue(
    fieldId: string,
    value: any,
  ): Promise<{ isValid: boolean; errors?: string[] }> {
    const field = await this.findOne(fieldId);
    const errors: string[] = [];

    // Required field validation
    if (field.isRequired && (value === null || value === undefined || value === '')) {
      errors.push(`${field.name} is required`);
    }

    // Type-specific validation
    switch (field.type) {
      case 'text':
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          errors.push(
            `${field.name} must be at least ${field.validation.minLength} characters`,
          );
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          errors.push(
            `${field.name} must be no more than ${field.validation.maxLength} characters`,
          );
        }
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            errors.push(
              field.validation.message || `${field.name} format is invalid`,
            );
          }
        }
        break;

      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors.push(`${field.name} must be a valid number`);
        } else {
          if (field.validation?.min !== undefined && numValue < field.validation.min) {
            errors.push(`${field.name} must be at least ${field.validation.min}`);
          }
          if (field.validation?.max !== undefined && numValue > field.validation.max) {
            errors.push(`${field.name} must be no more than ${field.validation.max}`);
          }
        }
        break;

      case 'select':
        if (field.options && !field.options.includes(value)) {
          errors.push(`${field.name} must be one of: ${field.options.join(', ')}`);
        }
        break;

      case 'multiselect':
        if (field.options && Array.isArray(value)) {
          const invalidOptions = value.filter(v => !field.options?.includes(v));
          if (invalidOptions.length > 0) {
            errors.push(
              `Invalid options for ${field.name}: ${invalidOptions.join(', ')}`,
            );
          }
        } else if (!Array.isArray(value)) {
          errors.push(`${field.name} must be an array`);
        }
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`${field.name} must be a valid date`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${field.name} must be true or false`);
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private generateFieldKey(
    name: string,
    entityType: string,
    organizationId: string,
  ): string {
    const normalized = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    return `${entityType}_${organizationId.substring(0, 8)}_${normalized}`;
  }
}