import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { MongoAbility } from "@casl/ability";

type Actions = "create" | "read" | "update" | "delete" | "manage";
type Subjects = "Role" | "Permission" | "User" | "Product" | "Order" | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function defineAbilityFor(userRoles: string[]) {
  const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (userRoles.includes("ADMIN")) {
    builder.can("manage", "all");
  }

  return builder.build();
}

export const ability = createMongoAbility<AppAbility>();
