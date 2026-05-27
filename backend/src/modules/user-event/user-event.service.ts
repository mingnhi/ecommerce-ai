import { Injectable } from '@nestjs/common';
import { CreateUserEventDto } from './dto/user-event.dto';
import { EntityManager } from '@mikro-orm/core';
import { UserEventType } from './dto/user-event.enum';
import { UserEvent } from '@entities/user-event.entity';
import { RecommendRequestDto } from './dto/recommendRequest.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';


@Injectable()
export class UserEventService {
  constructor(
    private readonly em: EntityManager,
    private readonly httpService: HttpService,
  ) { }
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
      categoryId: dto.categoryId,
      price: dto.price,
      eventType: dto.eventType,
      score: this.getScore(dto.eventType),
    });

    await this.em.persistAndFlush(event);
    return event;
  }

  async recommend(
    userId: string,
    dto: RecommendRequestDto,
  ) {
    const response = await firstValueFrom(
      this.httpService.post(
        'http://127.0.0.1:8000/api/v1/recommend/',
        {
          user_id: userId,
          top_k: dto.top_k ?? 10,

          products: dto.products.map((item) => ({
            id: item.productId,
            category_id: item.categoryId,
            price: item.price,
          })),
        },
        {
          headers: {
            'X-API-KEY': 'key-recommend',
          },
        },
      ),
    );

    return response.data;
  }
}
