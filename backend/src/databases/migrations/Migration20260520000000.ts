import { Migration } from '@mikro-orm/migrations';

export class Migration20260520000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      "alter table `orders` " +
        "modify `subtotal` numeric(12,2) not null default '0.00', " +
        "modify `discount_amount` numeric(12,2) not null default '0.00', " +
        "modify `total_price` numeric(12,2) not null default '0.00';",
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      "alter table `orders` " +
        "modify `subtotal` numeric(12,2) not null, " +
        "modify `discount_amount` numeric(12,2) not null, " +
        "modify `total_price` numeric(12,2) not null;",
    );
  }
}
