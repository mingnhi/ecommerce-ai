import { Entity, ManyToOne, PrimaryKeyProp } from "@mikro-orm/core";
import { Role } from "./roles.entity";
import { Permission } from "./permissions.entity";

@Entity({ tableName: 'role_permissions' })
export class RolePermission {
    [PrimaryKeyProp]?: ['role', 'permission'];

    @ManyToOne({
        entity: () => Role,
        primary: true,
        fieldName: 'role_id',
    })
    role!: Role;

    @ManyToOne({
        entity: () => Permission,
        primary: true,
        fieldName: 'permission_id',
    })
    permission!: Permission;
 }