import { useRef } from "react";
import { buttonVariants } from "./ui/button";
import type { IconRef } from "@/lib/types";
import { LogoutIcon } from "./ui/logout";

export function SignInButton() {
  const logoutRef = useRef<IconRef>(null);
  return (
    <a
      className={buttonVariants()}
      href="/auth/signin"
      onMouseEnter={() => logoutRef.current?.startAnimation()}
      onMouseLeave={() => logoutRef.current?.stopAnimation()}
    >
      <LogoutIcon ref={logoutRef} />
      <span className="group-data-[collapsible=icon]:hidden">Login</span>
    </a>
  );
}
