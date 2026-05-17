import { PartialType } from '@nestjs/mapped-types';

import { CreateCategoryRequest } from './create-category.request';

export class UpdateCategoryRequest extends PartialType(
  CreateCategoryRequest,
) {}