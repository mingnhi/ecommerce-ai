import { useCan } from "@/shared/hooks/use-can";

type CanProps = {
  permission: string;
  children: React.ReactNode;
};

export function Can({ permission, children }: CanProps) {
  if (!useCan(permission)) {
    return null;
  }

  return <>{children}</>;
}
