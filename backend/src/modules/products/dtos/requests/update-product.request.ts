import { PartialType } from '@nestjs/swagger';
import { CreateProductRequest } from './create-product.request';

export class UpdateProductRequest extends PartialType(CreateProductRequest) {}