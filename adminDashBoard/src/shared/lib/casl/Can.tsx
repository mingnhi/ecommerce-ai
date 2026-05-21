import { createContext, useContext } from "react";
import type { AppAbility } from "./ability";
import { ability } from "./ability";

export const AbilityContext = createContext<AppAbility>(ability);

export const useAbility = () => useContext(AbilityContext);

type CanProps = {
  I: "create" | "read" | "update" | "delete" | "manage";
  a: "Role" | "Permission" | "User" | "Product" | "Order" | "all";
  children: React.ReactNode;
};

export function Can({ I, a, children }: CanProps) {
  const ability = useAbility();
  
  if (ability.can(I, a)) {
    return <>{children}</>;
  }
  
  return null;
}
