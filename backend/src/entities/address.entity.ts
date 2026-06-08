import { Entity, Enum, Index, ManyToOne, Property } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';
import { Province } from './province.entity';
import { Ward } from './ward.entity';
import { User } from './user.entity';
import { AddressType } from '@modules/address/enums/address-type.enum';

@Entity({ tableName: 'addresses' })
@Index({ properties: ['userId'] })
export class Address extends AuditableEntity {
  @ManyToOne(() => User, {
    fieldName: 'user_id',
    deleteRule: 'cascade',
    mapToPk: true,
  })
  userId!: string;

  @Property({ type: 'string', length: 100, fieldName: 'full_name' })
  fullName!: string;

  @Property({ type: 'string', length: 20 })
  phone!: string;

  @Property({ type: 'string', length: 500, fieldName: 'address_line' })
  addressLine!: string;

  @ManyToOne(() => Province, {
    fieldName: 'province_id',
    mapToPk: true,
  })
  provinceId!: number;

  @ManyToOne(() => Ward, {
    fieldName: 'ward_id',
    mapToPk: true,
  })
  wardId!: number;

  @Enum({ items: () => AddressType, default: AddressType.HOME })
  type: AddressType = AddressType.HOME;

  @Property({ type: 'boolean', default: false, fieldName: 'is_deleted' })
  isDeleted: boolean = false;
}
