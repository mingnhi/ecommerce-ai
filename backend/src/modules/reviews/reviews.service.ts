import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  EntityManager,
  EntityRepository,
} from '@mikro-orm/mysql';

import { InjectRepository } from '@mikro-orm/nestjs';

import { ProductReviewEntity } from '@entities/product-review.entity';

import { ProductEntity } from '@entities/product.entity';

import { Users } from '@entities/user.entity';

import { ApiResponse } from '@common/interfaces/api-response.interface';

import { CreateReviewDto } from './dtos/create-review.dto';

import { QueryReviewDto } from './dtos/query-review.dto';

import { ReviewResponse } from './responses/review.response';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(
      ProductReviewEntity,
    )
    private readonly reviewRepository: EntityRepository<ProductReviewEntity>,

    @InjectRepository(
      ProductEntity,
    )
    private readonly productRepository: EntityRepository<ProductEntity>,

    @InjectRepository(
      Users,
    )
    private readonly userRepository: EntityRepository<Users>,

    private readonly em: EntityManager,
  ) {}

  async create(
    dto: CreateReviewDto,
  ): Promise<
    ApiResponse<ReviewResponse>
  > {
    const product =
      await this.productRepository.findOne({
        id: dto.productId,
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const user =
      await this.userRepository.findOne(
        {
          id: dto.userId,
        },
      );

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    // TODO:
    // kiểm tra user đã mua hàng

    const review =
      this.reviewRepository.create({
        product,

        user,

        rating: dto.rating,

        comment:
          dto.comment,
      });

    await this.em.persistAndFlush(
      review,
    );

    return {
      status: 'success',

      message:
        'Review created successfully',

      data: {
        id: review.id,

        productId:
          review.product.id,

        userId:
          review.user.id,

        rating:
          review.rating,

        comment:
          review.comment,

        createdAt:
          review.createdAt,
      },
    };
  }

  async findByProduct(
    productId: string,
    query: QueryReviewDto,
  ): Promise<
    ApiResponse<
      ReviewResponse[]
    >
  > {
    const page = Number(
      query.page || 1,
    );

    const limit = Number(
      query.limit || 10,
    );

    const offset =
      (page - 1) * limit;

    let orderBy: any = {
      createdAt: 'DESC',
    };

    if (
      query.sort === 'oldest'
    ) {
      orderBy = {
        createdAt: 'ASC',
      };
    }

    if (
      query.sort ===
      'rating_desc'
    ) {
      orderBy = {
        rating: 'DESC',
      };
    }

    if (
      query.sort ===
      'rating_asc'
    ) {
      orderBy = {
        rating: 'ASC',
      };
    }

    const [reviews, total] =
      await this.reviewRepository.findAndCount(
        {
          product: {
            id: productId,
          },
        },
        {
          populate: [
            'product',
            'user',
          ],

          limit,

          offset,

          orderBy,
        },
      );

    return {
      status: 'success',

      message:
        'Reviews fetched successfully',

      data: reviews.map(
        review => ({
          id: review.id,

          productId:
            review.product.id,

          userId:
            review.user.id,

          rating:
            review.rating,

          comment:
            review.comment,

          createdAt:
            review.createdAt,
        }),
      ),

      meta: {
        count: total,

        page,

        limit,

        totalPages:
          Math.ceil(
            total / limit,
          ),
      },
    };
  }
}