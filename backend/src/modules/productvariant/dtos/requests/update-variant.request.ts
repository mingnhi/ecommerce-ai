
import { PartialType } from '@nestjs/mapped-types';

import { CreateVariantRequest } from './create-variant.request';

export class UpdateVariantRequest extends PartialType(
  CreateVariantRequest,
) {}

