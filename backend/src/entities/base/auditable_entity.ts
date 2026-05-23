import {
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { v4 as uuidv4 } from 'uuid';

@Entity({ abstract: true })
export abstract class AuditableEntity {
  @PrimaryKey({
    type: 'varchar',
    length: 36,
  })
  id: string = uuidv4();

  @Property({
    fieldName: 'created_at',
    type: 'datetime',
    onCreate: () => new Date(),
  })
  createdAt: Date = new Date();

  @Property({
    fieldName: 'updated_at',
    type: 'datetime',
    nullable: true,
    onUpdate: () => new Date(),
  })
  updatedAt?: Date;
}