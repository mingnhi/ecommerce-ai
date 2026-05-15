import { Entity, PrimaryKey, Property } from "@mikro-orm/core"; 

@Entity({ tableName: 'products' }) 
export class Product { 
  @PrimaryKey() id: string; 
  @Property() name: string; 
  @Property() slug: string; 
  @Property() isDeleted: boolean = false; 
}