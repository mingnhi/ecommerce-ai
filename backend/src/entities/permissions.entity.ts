import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';
import { RolePermission } from './rolePermission.entity';

@Entity({ tableName: 'permissions' })
export class Permission extends AuditableEntity {
  @Property({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Property({ type: 'varchar', length: 100 })
  resource!: string;

  @Property({ type: 'varchar', length: 50 })
  action!: string;

  @Property({ type: 'nvarchar', length: 255, nullable: true })
  description?: string;

  @OneToMany(() => RolePermission, rp => rp.permission)
  rolePermissions = new Collection<RolePermission>(this);
}
