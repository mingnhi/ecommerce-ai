import { Entity, Index, ManyToOne, Property } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';
import { User } from './user.entity';

@Entity({ tableName: 'addresses' })
@Index({ properties: ['user', 'isDefault'] })
export class Address extends AuditableEntity {
  @ManyToOne(() => User, { deleteRule: 'cascade' })
  user!: User;

  @Property({ type: 'string', length: 100, fieldName: 'full_name' })
  fullName!: string;

  @Property({ type: 'string', length: 20 })
  phone!: string;

  @Property({ type: 'string', length: 500, fieldName: 'address_line' })
  addressLine!: string;

  @Property({ type: 'string', length: 100, nullable: true })
  ward?: string;

  @Property({ type: 'string', length: 100 })
  district!: string;

  @Property({ type: 'string', length: 100 })
  province!: string;

  @Property({ type: 'boolean', default: false, fieldName: 'is_default' })
  isDefault: boolean = false;

  @Property({ type: 'boolean', default: false, fieldName: 'is_deleted' })
  isDeleted: boolean = false;
}
