import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@mikro-orm/nestjs';

import {
  EntityManager,
  EntityRepository,
  FilterQuery,
  QueryOrder,
} from '@mikro-orm/mysql';

import slugify from 'slugify';

import { ProductEntity } from '@entities/product.entity';
import { CategoryEntity } from '@entities/category.entity';
import { ProductPriceEntity } from '@entities/product-price.entity';
import { ProductVariantEntity } from '@entities/product-variant.entity';
import { ProductAttributeEntity } from '@entities/product-attribute.entity';

import { CreateProductRequest } from './dtos/requests/create-product.request';
import { UpdateProductRequest } from './dtos/requests/update-product.request';
import { QueryProductRequest } from './dtos/requests/query-product.request';
import cloudinary from '@config/cloudinary.config';
@Injectable()
export class ProductsService {
  constructor(
    private readonly em: EntityManager,

    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: EntityRepository<CategoryEntity>,
  ) {}

  /** ====================== HELPER METHODS ====================== */

  private async generateSlug(name: string, excludeId?: string): Promise<string> {
    let slug = slugify(name, { lower: true, strict: true });
    let count = 1;
    const baseSlug = slug;

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

  private calculatePrice(originalPrice: number, discountPercent?: number): number {
    if (!discountPercent || discountPercent <= 0) return originalPrice;
    const discount = (originalPrice * discountPercent) / 100;
    return Math.round(originalPrice - discount);
  }

  /** ====================== CREATE ====================== */
  async create(request: CreateProductRequest) {
    const category = await this.categoryRepository.findOne({ id: request.categoryId });
    if (!category) throw new NotFoundException('Category not found');

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

    if (!product) throw new NotFoundException('Product not found');

    // Update basic info
    if (request.name) {
      product.name = request.name;
      product.slug = await this.generateSlug(request.name, id);
    }

    if (request.categoryId) {
      const category = await this.categoryRepository.findOne({ id: request.categoryId });
      if (!category) throw new NotFoundException('Category not found');
      product.category = category;
    }

    if (request.shortDescription !== undefined) product.shortDescription = request.shortDescription;
    if (request.description !== undefined) product.description = request.description;
    if (request.isActive !== undefined) product.isActive = request.isActive;

    // Replace relations
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

  /** ====================== PRIVATE ASSIGN HELPERS ====================== */

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

  /** ====================== FIND ALL ====================== */
  async findAll(query: QueryProductRequest) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);

    const where: FilterQuery<ProductEntity> = {};

    if (query.search) {
      where.$or = [
        { name: { $like: `%${query.search}%` } },
        { shortDescription: { $like: `%${query.search}%` } },
      ];
    }

    if (query.categoryId) where.category = query.categoryId;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    let orderBy: any = { createdAt: QueryOrder.DESC };

    switch (query.sort) {
      case 'oldest':
        orderBy = { createdAt: QueryOrder.ASC };
        break;
      case 'name_asc':
        orderBy = { name: QueryOrder.ASC };
        break;
      case 'name_desc':
        orderBy = { name: QueryOrder.DESC };
        break;
      case 'price_asc':
      case 'price_desc':
        orderBy = { createdAt: QueryOrder.DESC };
        break;
    }

    const [products, total] = await this.productRepository.findAndCount(where, {
      populate: ['category', 'images', 'prices'],
      orderBy,
      limit,
      offset: (page - 1) * limit,
    });

    const formattedProducts = products.map((product) => {
      const activePrice = product.prices?.find((p) => p.isActive) || product.prices?.[0];

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        thumbnail: product.thumbnail || product.images?.[0]?.imageUrl || null,
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

    // Sort by price if needed
    if (query.sort === 'price_asc') {
      formattedProducts.sort((a, b) => (a.price?.price || 0) - (b.price?.price || 0));
    }
    if (query.sort === 'price_desc') {
      formattedProducts.sort((a, b) => (b.price?.price || 0) - (a.price?.price || 0));
    }

    return {
      message: 'Get products successfully',
      data: { products: formattedProducts },
      meta: {
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /** ====================== FIND BY SLUG ====================== */
  async findBySlug(slug: string) {
    const product = await this.productRepository.findOne(
      { slug },
      { populate: ['category', 'images', 'prices', 'variants', 'attributes'] },
    );

    if (!product) throw new NotFoundException('Product not found');

    return {
      message: 'Get product successfully',
      data: {
        product: this.toProductDetailResponse(product),
      },
      meta: {},
    };
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
    };
  }

  /** ====================== DELETE ====================== */
  async remove(id: string) {
  const product = await this.productRepository.findOne(
    { id },
    {
      populate: [
        'prices',
        'variants',
        'attributes',
        'images',
        'reviews',
      ],
    },
  );

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  // 1. Delete Cloudinary images first
  for (const image of product.images.getItems()) {
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (error) {
        console.warn(
          `Cloudinary delete failed for ${image.publicId}:`,
          error,
        );
      }
    }
  }

  // 2. Delete child records
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

  // flush child deletes first
  await this.em.flush();

  // 3. Delete product
  await this.em.removeAndFlush(product);

  return {
    message: 'Product deleted successfully',
    data: null,
    meta: {},
  };
}
}