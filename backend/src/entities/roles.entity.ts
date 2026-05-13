import { Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { AuditableEntity } from "./base/auditable_entity";
import { RolePermission } from "./rolePermission.entity";
import { UserRole } from "./userRoles.entity";

@Entity({ tableName: 'roles' })
export class Role extends AuditableEntity {
    @Property({ type: 'varchar', length: 100, nullable: true })
    name!: string;

    @Property({ type: 'varchar', length: 255, nullable: true })
    description?: string;

    @OneToMany(() => RolePermission, rp => rp.role)
    rolePermissions = new Collection<RolePermission>(this);

    @OneToMany(() => UserRole, ur => ur.role)
    userRoles = new Collection<UserRole>(this);
 }