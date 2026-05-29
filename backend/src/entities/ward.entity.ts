import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Province } from './province.entity';

@Entity({ tableName: 'wards' })
export class Ward {
  @PrimaryKey({ type: 'int' })
  id!: number;

  @ManyToOne(() => Province, {
    fieldName: 'province_id',
    mapToPk: true,
  })
  provinceId!: number;

  @Property({ nullable: true })
  name?: string;

  @Property({ nullable: true })
  slug?: string;

  @Property({ length: 50, nullable: true })
  type?: string;

  @Property({ fieldName: 'name_with_type', nullable: true })
  nameWithType?: string;

  @Property({ nullable: true })
  path?: string;

  @Property({ fieldName: 'path_with_type', nullable: true })
  pathWithType?: string;
}
