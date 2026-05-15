import { Migration } from '@mikro-orm/migrations';

export class Migration20260514145348 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`users\` drop column \`is_email_verified\`;`);

    this.addSql(`alter table \`users\` add \`email_otp_hash\` varchar(255) null, add \`email_otp_expires_at\` datetime null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`users\` drop column \`email_otp_hash\`, drop column \`email_otp_expires_at\`;`);

    this.addSql(`alter table \`users\` add \`is_email_verified\` tinyint(1) not null default false;`);
  }

}
