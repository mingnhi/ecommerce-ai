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
  FilterQuery,
  QueryOrder,
} from '@mikro-orm/core';

import slugify from 'slugify';

import cloudinary from '@config/cloudinary.config';

import { ProductEntity } from '@entities/product.entity';
import { CategoryEntity } from '@entities/category.entity';
import { ProductPriceEntity } from '@entities/product-price.entity';
import { ProductVariantEntity } from '@entities/product-variant.entity';
import { ProductAttributeEntity } from '@entities/product-attribute.entity';
import { ProductReviewEntity } from '@entities/product-review.entity';
import { User } from '@entities/user.entity';   // ← Thêm

import { CreateProductRequest } from './dtos/requests/create-product.request';
import { UpdateProductRequest } from './dtos/requests/update-product.request';
import { QueryProductRequest } from './dtos/requests/query-product.request';
import { CreateReviewRequest } from './dtos/requests/create-review.request';
import { UpdateReviewRequest } from './dtos/requests/update-review.request';   // ← Thêm
import { QueryReviewRequest } from './dtos/requests/query-review.request';

@Injectable()
export class ProductsService {
  constructor(
    private readonly em: EntityManager,

    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: EntityRepository<CategoryEntity>,

    @InjectRepository(ProductReviewEntity)
    private readonly reviewRepository: EntityRepository<ProductReviewEntity>,   // ← Thêm
  ) {}

  /** ====================== HELPERS ====================== */

  private async generateSlug(
    name: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const baseSlug = slug;
    let count = 1;

    while (true) {
      const existing = await this.productRepository.findOne({
        slug,
        ...(excludeId && { id: { $ne: excludeId } }),
      });

      if (!existing) break;
      slug = `${baseSlug}-${count++}`;
    }

    return slug;
  }

  private calculatePrice(
    originalPrice: number,
    discountPercent?: number,
  ): number {
    if (!discountPercent || discountPercent <= 0) {
      return originalPrice;
    }

    const discount = (originalPrice * discountPercent) / 100;
    return Math.round(originalPrice - discount);
  }

/** ====================== REVIEWS ====================== */

// Trong ProductsService

async getAllReviews(query: QueryReviewRequest) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const skip = (page - 1) * limit;

  let where: FilterQuery<ProductReviewEntity> = {};

  // Search
  if (query.search) {
    where.$or = [
      { comment: { $like: `%${query.search}%` } },
      { user: { fullName: { $like: `%${query.search}%` } } },
    ];
  }

  // Filter by product
  if (query.productId) {
    where.product = query.productId;
  }

  // Filter by min rating
  if (query.minRating) {
    where.rating = { $gte: query.minRating };
  }

  const [reviews, total] = await this.reviewRepository.findAndCount(
    where,
    {
      populate: ['user', 'product'],
      orderBy: { createdAt: QueryOrder.DESC },
      limit,
      offset: skip,
    },
  );

  const formattedReviews = reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    userId: review.user.id,
    userName: (review.user as any).fullName,
    productId: review.product.id,
    productName: review.product.name,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  }));

  return {
    reviews: formattedReviews,
    pagination: {
      page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async createReview(
  productId: string,
  request: CreateReviewRequest,
  userId: string,
) {
  console.log('Service - createReview called with:', { productId, userId, rating: request.rating });

  if (!userId) {
    throw new BadRequestException('User not authenticated');
  }

  if (!request.rating || request.rating < 1 || request.rating > 5) {
    throw new BadRequestException('Rating must be between 1 and 5');
  }

  const product = await this.productRepository.findOne({ id: productId });
  if (!product) {
    throw new NotFoundException('Product not found');
  }

  const existing = await this.reviewRepository.findOne({
    product: productId,
    user: userId,
  });

  if (existing) {
    throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');
  }

  const review = this.em.create(ProductReviewEntity, {
    product,
    user: this.em.getReference(User, userId),
    rating: request.rating,
    comment: request.comment,
  });

  await this.em.persistAndFlush(review);

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    userId: userId,
    createdAt: review.createdAt,
  };
}

  async getReviews(productId: string) {
    const reviews = await this.reviewRepository.find(
      { product: productId },
      {
        populate: ['user'],
        orderBy: { createdAt: QueryOrder.DESC },
      },
    );

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      user: {
        id: review.user.id,
        fullName: (review.user as any).fullName,
      },
      createdAt: review.createdAt,
    }));
  }

  async updateReview(
    productId: string,
    reviewId: string,
    request: UpdateReviewRequest,
  ) {
    const review = await this.reviewRepository.findOne({
      id: reviewId,
      product: productId,
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (request.rating !== undefined) review.rating = request.rating;
    if (request.comment !== undefined) review.comment = request.comment;

    await this.em.flush();

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      userId: review.user.id,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  async deleteReview(productId: string, reviewId: string) {
    const review = await this.reviewRepository.findOne({
      id: reviewId,
      product: productId,
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.em.removeAndFlush(review);
    return { message: 'Review deleted successfully' };
  }

  /** ====================== CREATE ====================== */

  async create(request: CreateProductRequest) {
    const category = await this.categoryRepository.findOne({
      id: request.categoryId,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const slug = await this.generateSlug(request.name);

    const product = this.em.create(ProductEntity, {
      category,
      name: request.name,
      slug,
      shortDescription: request.shortDescription,
      description: request.description,
      isActive: request.isActive ?? true,
    });

    this.assignPrices(product, request.prices || []);
    this.assignVariants(product, request.variants || []);
    this.assignAttributes(product, request.attributes || []);

    await this.em.persistAndFlush(product);

    return await this.findBySlug(slug);
  }

  /** ====================== UPDATE ====================== */

  async update(id: string, request: UpdateProductRequest) {
    const product = await this.productRepository.findOne(
      { id },
      { populate: ['prices', 'variants', 'attributes'] },
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (request.name) {
      product.name = request.name;
      product.slug = await this.generateSlug(request.name, id);
    }

    if (request.categoryId) {
      const category = await this.categoryRepository.findOne({
        id: request.categoryId,
      });
      if (!category) throw new NotFoundException('Category not found');
      product.category = category;
    }

    if (request.shortDescription !== undefined) product.shortDescription = request.shortDescription;
    if (request.description !== undefined) product.description = request.description;
    if (request.isActive !== undefined) product.isActive = request.isActive;

    if (request.prices !== undefined) {
      product.prices.removeAll();
      this.assignPrices(product, request.prices);
    }

    if (request.variants !== undefined) {
      product.variants.removeAll();
      this.assignVariants(product, request.variants);
    }

    if (request.attributes !== undefined) {
      product.attributes.removeAll();
      this.assignAttributes(product, request.attributes);
    }

    await this.em.flush();

    return await this.findBySlug(product.slug);
  }

 /** ====================== FIND ALL ====================== */

  async findAll(
    query: QueryProductRequest,
  ) {
    const page = Number(query.page || 1);

    const limit = Number(
      query.limit || 20,
    );

    let where: FilterQuery<ProductEntity> =
      {};

    if (query.search) {
      where.$or = [
        {
          name: {
            $like: `%${query.search}%`,
          },
        },
        {
          shortDescription: {
            $like: `%${query.search}%`,
          },
        },
      ];
    }

    if (query.categoryId) {
      where.category =
        query.categoryId;
    }

    if (
      query.isActive !== undefined
    ) {
      where.isActive =
        query.isActive;
    }

    const priceWhere = await this.applyPriceFilter(
      where,
      query.minPrice,
      query.maxPrice,
    );
    if (priceWhere === 'empty') {
      return {
        products: [],
        pagination: {
          page,
          limit,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }
    where = priceWhere;

    if (query.sort === 'best_selling') {
      return this.findAllByBestSelling(
        where,
        page,
        limit,
      );
    }

    let orderBy: any = {
      createdAt: QueryOrder.DESC,
    };

    switch (query.sort) {
      case 'oldest':
        orderBy = {
          createdAt:
            QueryOrder.ASC,
        };
        break;

      case 'name_asc':
        orderBy = {
          name: QueryOrder.ASC,
        };
        break;

      case 'name_desc':
        orderBy = {
          name:
            QueryOrder.DESC,
        };
        break;

      case 'price_asc':
      case 'price_desc':
        orderBy = {
          createdAt:
            QueryOrder.DESC,
        };
        break;
    }

    const [products, total] =
      await this.productRepository.findAndCount(
        where,
        {
          populate: [
            'category',
            'images',
            'prices',
          ],
          orderBy,
          limit,
          offset:
            (page - 1) * limit,
        },
      );

    let formattedProducts = this.formatProductList(products);

    if (query.sort === 'price_asc') {
      formattedProducts.sort(
        (a, b) =>
          (a.price?.price || 0) -
          (b.price?.price || 0),
      );
    }

    if (query.sort === 'price_desc') {
      formattedProducts.sort(
        (a, b) =>
          (b.price?.price || 0) -
          (a.price?.price || 0),
      );
    }

    return {
      products: formattedProducts,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async findAllByBestSelling(
    where: FilterQuery<ProductEntity>,
    page: number,
    limit: number,
  ) {
    const matches = await this.productRepository.find(where, {
      fields: ['id'],
    });
    const ids = matches.map((product) => product.id);
    const salesMap = await this.getSalesCountByProductIds(ids);

    const sortedIds = [...ids].sort(
      (a, b) => (salesMap.get(b) ?? 0) - (salesMap.get(a) ?? 0),
    );

    const total = sortedIds.length;
    const pageIds = sortedIds.slice((page - 1) * limit, page * limit);

    const products = pageIds.length
      ? await this.productRepository.find(
        { id: { $in: pageIds } },
        {
          populate: ['category', 'images', 'prices'],
        },
      )
      : [];

    const productMap = new Map(products.map((product) => [product.id, product]));
    const ordered = pageIds
      .map((id) => productMap.get(id))
      .filter(Boolean) as ProductEntity[];

    return {
      products: this.formatProductList(ordered),
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getActivePriceRange(): Promise<{
    min: number;
    max: number;
  }> {
    const rows = (await this.em
      .getConnection()
      .execute(
        `SELECT MIN(pp.price) AS minPrice, MAX(pp.price) AS maxPrice
         FROM product_prices pp
         WHERE pp.is_active = 1`,
      )) as {
        minPrice: string | number | null;
        maxPrice: string | number | null;
      }[];

    const max = Number(rows[0]?.maxPrice) || 0;

    return {
      min: 0,
      max: this.roundUpPrice(max),
    };
  }

  private roundUpPrice(value: number): number {
    if (value <= 0) return 10;
    const power = Math.pow(10, Math.floor(Math.log10(value)));
    const unit = value / power;
    const factor =
      unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10;
    return factor * power;
  }

  private async applyPriceFilter(
    where: FilterQuery<ProductEntity>,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<FilterQuery<ProductEntity> | 'empty'> {
    const ids = await this.resolveProductIdsByPrice(
      minPrice,
      maxPrice,
    );
    if (ids === null) {
      return where;
    }
    if (!ids.length) {
      return 'empty';
    }
    return {
      $and: [where, { id: { $in: ids } }],
    } as FilterQuery<ProductEntity>;
  }

  private async resolveProductIdsByPrice(
    minPrice?: number,
    maxPrice?: number,
  ): Promise<string[] | null> {
    if (minPrice == null && maxPrice == null) {
      return null;
    }

    const conditions = ['pp.is_active = 1'];
    const params: number[] = [];

    if (minPrice != null) {
      conditions.push('pp.price >= ?');
      params.push(minPrice);
    }
    if (maxPrice != null) {
      conditions.push('pp.price <= ?');
      params.push(maxPrice);
    }

    const rows = (await this.em
      .getConnection()
      .execute(
        `SELECT DISTINCT pp.product_id AS id
         FROM product_prices pp
         WHERE ${conditions.join(' AND ')}`,
        params,
      )) as { id: string }[];

    return rows.map((row) => row.id);
  }

  private async getSalesCountByProductIds(
    productIds: string[],
  ): Promise<Map<string, number>> {
    if (!productIds.length) {
      return new Map();
    }

    const placeholders = productIds.map(() => '?').join(',');
    const rows = (await this.em.getConnection().execute(
      `SELECT pv.product_id AS productId, COALESCE(SUM(oi.quantity), 0) AS sold
       FROM order_items oi
       INNER JOIN product_variants pv ON pv.id = oi.variant_id
       WHERE pv.product_id IN (${placeholders})
       GROUP BY pv.product_id`,
      productIds,
    )) as { productId: string; sold: number | string }[];

    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.productId, Number(row.sold) || 0);
    }
    return map;
  }

  private formatProductList(products: ProductEntity[]) {
    return products.map((product) => {
      const activePrice =
        product.prices?.find((p) => p.isActive) || product.prices?.[0];

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        thumbnail:
          product.thumbnail || product.images?.[0]?.imageUrl || null,
        isActive: product.isActive,
        category: {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        },
        price: activePrice
          ? {
            price: activePrice.price,
            originalPrice: activePrice.originalPrice,
            discountPercent: activePrice.discountPercent,
            currency: activePrice.currency,
          }
          : null,
        createdAt: product.createdAt,
      };
    });
  }

  /** ====================== FIND DETAIL ====================== */

  async findBySlug(slug: string) {
    const product = await this.productRepository.findOne(
      { slug },
      {
        populate: [
          'category',
          'images',
          'prices',
          'variants',
          'attributes',
          'reviews.user',        // ← Thêm
        ],
      },
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toProductDetailResponse(product);
  }

  private toProductDetailResponse(product: ProductEntity) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      thumbnail: product.thumbnail,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,

      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },

      prices: product.prices.toArray().map((p) => ({
        originalPrice: p.originalPrice,
        discountPercent: p.discountPercent,
        price: p.price,
        currency: p.currency,
        isActive: p.isActive,
      })),

      variants: product.variants.toArray().map((v: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        stock: v.stock,
        price: v.price,
        image: v.image,
        isActive: v.isActive,
        attributes: v.attributes || {},
      })),

      attributes: product.attributes.toArray().map((a) => ({
        id: a.id,
        name: a.name,
        value: a.value,
      })),

      images: product.images.toArray().map((i) => ({
        id: i.id,
        imageUrl: i.imageUrl,
        type: i.type,
        sortOrder: i.sortOrder,
        isPrimary: i.isPrimary,
      })),

      // === REVIEWS ===
      reviews: product.reviews?.isInitialized()
        ? product.reviews.getItems().map((r: any) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            user: {
              id: r.user.id,
              fullName: r.user.fullName,
            },
            createdAt: r.createdAt,
          }))
        : [],
    };
  }

  /** ====================== DELETE ====================== */

  async remove(id: string) {
    const product = await this.productRepository.findOne(
      { id },
      {
        populate: ['prices', 'variants', 'attributes', 'images', 'reviews'],
      },
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Xóa ảnh trên Cloudinary
    for (const image of product.images.getItems()) {
      if (image.publicId) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (error) {
          console.warn(`Cloudinary delete failed for ${image.publicId}:`, error);
        }
      }
    }

    if (product.prices.isInitialized() && product.prices.count() > 0) {
      await this.em.remove(product.prices.getItems());
    }
    if (product.variants.isInitialized() && product.variants.count() > 0) {
      await this.em.remove(product.variants.getItems());
    }
    if (product.attributes.isInitialized() && product.attributes.count() > 0) {
      await this.em.remove(product.attributes.getItems());
    }
    if (product.images.isInitialized() && product.images.count() > 0) {
      await this.em.remove(product.images.getItems());
    }
    if (product.reviews.isInitialized() && product.reviews.count() > 0) {
      await this.em.remove(product.reviews.getItems());
    }

    await this.em.flush();
    await this.em.removeAndFlush(product);

    return { message: 'Product deleted successfully' };
  }

  /** ====================== PRIVATE RELATIONS ====================== */

  private assignPrices(product: ProductEntity, prices: any[]) {
    for (const p of prices) {
      const priceEntity = this.em.create(ProductPriceEntity, {
        product,
        originalPrice: p.originalPrice,
        discountPercent: p.discountPercent,
        price: this.calculatePrice(p.originalPrice, p.discountPercent),
        currency: p.currency || 'VND',
        isActive: p.isActive ?? true,
      });
      product.prices.add(priceEntity);
    }
  }

  private assignVariants(product: ProductEntity, variants: any[]) {
    for (const v of variants) {
      const variantEntity = this.em.create(ProductVariantEntity, {
        product,
        title: v.title,
        sku: v.sku,
        stock: v.stock ?? 0,
        price: v.price,
        image: v.image,
        isActive: v.isActive ?? true,
        attributes: v.attributes || {},
      });
      product.variants.add(variantEntity);
    }
  }

  private assignAttributes(product: ProductEntity, attributes: any[]) {
    for (const a of attributes) {
      const attrEntity = this.em.create(ProductAttributeEntity, {
        product,
        name: a.name,
        value: a.value,
      });
      product.attributes.add(attrEntity);
    }
  }
}