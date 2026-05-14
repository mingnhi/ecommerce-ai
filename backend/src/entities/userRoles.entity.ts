import { Entity, ManyToOne, PrimaryKeyProp } from "@mikro-orm/core";
import { User } from "./user.entity";
import { Role } from "./roles.entity";
import { AuditableEntity } from "./base/auditable_entity";

@Entity({ tableName: 'user_roles' })
export class UserRole extends AuditableEntity {

    [PrimaryKeyProp]?: ['user', 'role'];

    @ManyToOne({
        entity: () => User,
        primary: true,
        fieldName: 'user_id',
    })
    user!: User;

    @ManyToOne({
        entity: () => Role,
        primary: true,
        fieldName: 'role_id',
    })
    role!: Role;
}