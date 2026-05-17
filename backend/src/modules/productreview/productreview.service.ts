import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@mikro-orm/nestjs';

import {
  EntityRepository,
} from '@mikro-orm/mysql';

import {
  QueryOrder,
} from '@mikro-orm/core';

import { ProductEntity } from '@entities/product.entity';

import { ProductReviewEntity } from '@entities/product-review.entity';

import { Users } from '@entities/user.entity';

import { CreateProductReviewRequest } from './dtos/requests/create-product-review.request';

import { QueryProductReviewRequest } from './dtos/requests/query-product-review.request';

@Injectable()
export class ProductReviewService {
  constructor(
    @InjectRepository(ProductReviewEntity)
    private readonly reviewRepository: EntityRepository<ProductReviewEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,

    @InjectRepository(Users)
    private readonly userRepository: EntityRepository<Users>,
  ) {}

  async findByProduct(
    productId: string,
    query: QueryProductReviewRequest,
  ) {
    const page =
      Number(query.page || 1);

    const limit =
      Number(query.limit || 10);

    const [reviews, count] =
      await this.reviewRepository.findAndCount(
        {
          product: productId,
        },
        {
          populate: ['user'],

          limit,

          offset:
            (page - 1) * limit,

          orderBy: {
            createdAt:
              query.sort ===
              'oldest'
                ? QueryOrder.ASC
                : QueryOrder.DESC,
          },
        },
      );

    return {
      data: reviews.map(review =>
        this.mapReview(review),
      ),

      pagination: {
        page,

        limit,

        total: count,

        totalPages:
          Math.ceil(
            count / limit,
          ),
      },
    };
  }

  async create(
    request: CreateProductReviewRequest,
  ) {
    const product =
      await this.productRepository.findOne(
        {
          id: request.productId,
        },
      );

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const user =
      await this.userRepository.findOne(
        {
          id: request.userId,
        },
      );

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    /**
     * TODO:
     * kiểm tra user đã mua hàng
     */

    const review =
      this.reviewRepository.create({
        product,

        user,

        rating:
          request.rating,

        comment:
          request.comment,
      });

    await this.reviewRepository
      .getEntityManager()
      .persistAndFlush(review);

    return this.mapReview(
      review,
    );
  }

  private mapReview(
    review: ProductReviewEntity,
  ) {
    return {
      id: review.id,

      rating:
        review.rating,

      comment:
        review.comment,

      user: {
        id:
          review.user.id,

        displayName:
          review.user
            .displayName,

        avatarUrl:
          review.user
            .avatarUrl,
      },

      createdAt:
        review.createdAt,
    };
  }
}