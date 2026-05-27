import { Injectable } from '@nestjs/common';
import { CreateUserEventDto } from './dto/user-event.dto';
import { EntityManager } from '@mikro-orm/core';
import { UserEventType } from './dto/user-event.enum';
import { UserEvent } from '@entities/user-event.entity';


@Injectable()
export class UserEventService {
  constructor(private readonly em: EntityManager) { }
  private getScore(eventType: UserEventType) {
    switch (eventType) {
      case UserEventType.VIEW:
        return 1;
      case UserEventType.CLICK:
        return 2;
      case UserEventType.ADD_TO_CART:
        return 3;
      case UserEventType.REVIEW:
        return 4;
      case UserEventType.PURCHASE:
        return 5;
      default:
        return 1;
    }
  }
  async create(userId: string, dto: CreateUserEventDto) {
    const event = this.em.create(UserEvent, {
      userId,
      productId: dto.productId,
      eventType: dto.eventType,
      score: this.getScore(dto.eventType),
    });

    await this.em.persistAndFlush(event);
    return event;
  }
}
