import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@mikro-orm/nestjs';

import {
  EntityManager,
  EntityRepository,
  QueryOrder,
} from '@mikro-orm/mysql';

import { ProductEntity } from '@entities/product.entity';

import { ProductReviewEntity } from '@entities/product-review.entity';

import { User } from '@entities/user.entity';

import { CreateProductReviewRequest } from './dtos/requests/create-product-review.request';

import { QueryProductReviewRequest } from './dtos/requests/query-product-review.request';

@Injectable()
export class ProductReviewService {
  constructor(
    private readonly em: EntityManager,

    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,

    @InjectRepository(ProductReviewEntity)
    private readonly reviewRepository: EntityRepository<ProductReviewEntity>,

    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  /**
   * get reviews
   */
  async findByProduct(
    productId: string,
    query: QueryProductReviewRequest,
  ) {
    const product =
      await this.productRepository.findOne({
        id: productId,
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const page =
      Number(query.page || 1);

    const limit =
      Number(query.limit || 10);

    const [reviews, total] =
      await this.reviewRepository.findAndCount(
        {
          product,
        },
        {
          populate: ['user'],

          orderBy: {
            createdAt:
              query.sort ===
              'oldest'
                ? QueryOrder.ASC
                : QueryOrder.DESC,
          },

          limit,

          offset:
            (page - 1) * limit,
        },
      );

    const allReviews =
      await this.reviewRepository.find(
        {
          product,
        },
      );

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce(
            (
              total,
              review,
            ) =>
              total +
              review.rating,
            0,
          ) /
          allReviews.length
        : 0;

    return {
      message:
        'Get reviews successfully',

      data: {
        reviews: reviews.map(
          review => ({
            id: review.id,

            rating:
              review.rating,

            comment:
              review.comment,

            createdAt:
              review.createdAt,

            user: {
              id:
                review.user.id,

              email:
                review.user.email,

              displayName:
                review.user.fullName,

              // avatarUrl:
              //   review.user
              //     .avatarUrl,
            },
          }),
        ),
      },

      meta: {
        pagination: {
          page,

          limit,

          totalItems:
            total,

          totalPages:
            Math.ceil(
              total / limit,
            ),
        },

        summary: {
          averageRating:
            Number(
              averageRating.toFixed(
                1,
              ),
            ),

          totalReviews:
            allReviews.length,
        },
      },
    };
  }

  /**
   * create review
   */
  async create(
    request: CreateProductReviewRequest,
  ) {
    const product =
      await this.productRepository.findOne({
        id: request.productId,
      });

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
     * duplicate review
     */
    const existedReview =
      await this.reviewRepository.findOne(
        {
          product,
          user,
        },
      );

    if (existedReview) {
      throw new BadRequestException(
        'You already reviewed this product',
      );
    }

    const review =
      this.em.create(
        ProductReviewEntity,
        {
          product,

          user,

          rating:
            request.rating,

          comment:
            request.comment,
        },
      );

    await this.em.persistAndFlush(
      review,
    );

    return {
      message:
        'Review created successfully',

      data: {
        review: {
          id: review.id,

          rating:
            review.rating,

          comment:
            review.comment,

          createdAt:
            review.createdAt,

          user: {
            id: user.id,

            email:
              user.email,

            displayName:
              user.fullName,

            // avatarUrl:
            //   user.avatarUrl,
          },
        },
      },

      meta: {},
    };
  }
}

