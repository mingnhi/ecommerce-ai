import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'provinces' })
export class Province {
  @PrimaryKey({ type: 'int' })
  id!: number;

  @Property({ nullable: true })
  name?: string;

  @Property({ fieldName: 'name_slug', nullable: true })
  nameSlug?: string;

  @Property({ fieldName: 'full_name', nullable: true })
  fullName?: string;

  @Property({ length: 50, nullable: true })
  type?: string;
}
