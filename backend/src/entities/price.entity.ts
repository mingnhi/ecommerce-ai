import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core"; 
import { Product } from "./product.entity";

@Entity({ tableName: 'prices' }) 
export class Price { 
  @PrimaryKey() id: string; 
  @ManyToOne(() => Product, { fieldName: 'product_id' }) 
  product: Product; 
  @Property() price: string; 
  @Property() startDate: Date; 
  @Property() endDate: Date; 
  @Property() createdAt: Date = new Date(); 
  @Property() isActive: boolean = true; 
}