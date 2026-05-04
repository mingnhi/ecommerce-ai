import { Injectable, NotFoundException } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';
import { PrismaService } from '../../database/prisma.service';

export class CreateCategoryDto {
  @IsString() name: string;
  @IsString() slug: string;
  @IsOptional() @IsString() description?: string;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Danh mục không tồn tại');
    return cat;
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }
}
