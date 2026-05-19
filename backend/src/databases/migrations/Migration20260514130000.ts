import { Migration } from '@mikro-orm/migrations';

export class Migration20260514130000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`wishlists\` (
      \`id\` varchar(255) not null,
      \`user_id\` varchar(255) not null,
      \`product_id\` varchar(255) not null,
      \`created_at\` datetime not null,
      primary key (\`id\`)
    ) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`alter table \`wishlists\` add unique \`wishlists_user_id_product_id_unique\`(\`user_id\`, \`product_id\`);`);
    this.addSql(`alter table \`wishlists\` add index \`wishlists_user_id_created_at_index\`(\`user_id\`, \`created_at\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`wishlists\`;`);
  }

}
