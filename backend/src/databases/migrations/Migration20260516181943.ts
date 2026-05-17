import { Migration } from '@mikro-orm/migrations';

export class Migration20260516181943 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`permissions\` modify \`description\` nvarchar(255);`);

    this.addSql(`alter table \`otps\` drop column \`otp_hash\`;`);

    this.addSql(`alter table \`otps\` add \`otp\` int not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`otps\` drop column \`otp\`;`);

    this.addSql(`alter table \`otps\` add \`otp_hash\` varchar(255) not null;`);

    this.addSql(`alter table \`permissions\` modify \`description\` varchar(255);`);
  }

}
