import { Migration } from '@mikro-orm/migrations';

export class Migration20260516153320 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`otps\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(255) not null, \`otp_hash\` varchar(255) not null, \`type\` enum('REGISTER', 'FORGOT_PASSWORD') not null, \`expires_at\` datetime not null, \`is_used\` tinyint(1) not null default false, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`otps\` add index \`otps_user_id_index\`(\`user_id\`);`);

    this.addSql(`alter table \`otps\` add constraint \`otps_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`users\` drop column \`email_otp_hash\`, drop column \`email_otp_expires_at\`;`);

    this.addSql(`alter table \`users\` modify \`status\` enum('ACTIVE', 'INACTIVE', 'BANNED') not null default 'ACTIVE';`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`otps\`;`);

    this.addSql(`alter table \`users\` add \`email_otp_hash\` varchar(255) null, add \`email_otp_expires_at\` datetime null;`);
    this.addSql(`alter table \`users\` modify \`status\` enum('ACTIVE', 'INACTIVE', ' BANNED') not null default 'ACTIVE';`);
  }

}
