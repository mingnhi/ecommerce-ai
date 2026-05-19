import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';

import { AuditableEntity } from './base/auditable_entity';

@Entity({
  tableName: 'categories',
})
export class CategoryEntity extends AuditableEntity {
  @Property()
  name: string;

  @Property({
    unique: true,
  })
  slug: string;

  @Property({
    fieldName: 'is_active',
    default: true,
  })
  isActive: boolean = true;

  @ManyToOne(
    () => CategoryEntity,
    {
      nullable: true,
      fieldName: 'parent_id',
    },
  )
  parent?: CategoryEntity;

  @OneToMany(
    () => CategoryEntity,
    category => category.parent,
  )
  children =
    new Collection<CategoryEntity>(
      this,
    );
}