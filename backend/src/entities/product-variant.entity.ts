import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core"; 
import { Product } from "./product.entity";

@Entity({ tableName: 'product_variants' }) 
export class ProductVariant { 
  @PrimaryKey() id: string; 
  @ManyToOne(() => Product, { fieldName: 'product_id' }) 
  product: Product; 
  @Property() price: string; 
  @Property() isDeleted: boolean = false; 
}