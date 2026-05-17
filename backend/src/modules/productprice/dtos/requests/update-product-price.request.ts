import { PartialType } from '@nestjs/mapped-types';

import { CreateProductPriceRequest } from './create-product-price.request';

export class UpdateProductPriceRequest extends PartialType(
  CreateProductPriceRequest,
) {}