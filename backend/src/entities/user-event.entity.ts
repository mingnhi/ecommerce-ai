import { Entity, Enum, Property } from "@mikro-orm/core";
import { AuditableEntity } from "./base/auditable_entity";
import { UserEventType } from "@modules/user-event/dto/user-event.enum";

@Entity({ tableName: 'user_events' })
export class UserEvent extends AuditableEntity {
    @Property()
    userId!: string;

    @Property()
    productId!: string;

    @Enum(() => UserEventType)
    eventType!: UserEventType;

    @Property({ type: 'float' })
    score: number = 1;
}