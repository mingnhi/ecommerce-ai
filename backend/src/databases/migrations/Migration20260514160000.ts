import { Migration } from '@mikro-orm/migrations';

export class Migration20260514160000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`audit_logs\` (
      \`id\` varchar(255) not null,
      \`created_at\` datetime not null,
      \`updated_at\` datetime null,
      \`action\` varchar(100) not null,
      \`entity_type\` varchar(50) null,
      \`entity_id\` varchar(255) null,
      \`actor_user_id\` varchar(255) null,
      \`trace_id\` varchar(255) null,
      \`ip_address\` varchar(45) null,
      \`description\` varchar(500) null,
      \`metadata\` json null,
      primary key (\`id\`)
    ) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`alter table \`audit_logs\` add index \`audit_logs_actor_user_id_created_at_index\`(\`actor_user_id\`, \`created_at\`);`);
    this.addSql(`alter table \`audit_logs\` add index \`audit_logs_entity_type_entity_id_index\`(\`entity_type\`, \`entity_id\`);`);
    this.addSql(`alter table \`audit_logs\` add index \`audit_logs_action_index\`(\`action\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`audit_logs\`;`);
  }

}
