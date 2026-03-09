"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/my-data", label: "Meus Dados" },
];

function UserAvatar({ name, photoUrl }: { name?: string; photoUrl?: string }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className="h-8 w-8 rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div className="h-8 w-8 rounded-full bg-foreground/[0.08] flex items-center justify-center">
      <span className="text-[11px] font-semibold text-foreground/60">{initials}</span>
    </div>
  );
}

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showAdmin, setShowAdmin] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string; photoUrl?: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((data) => setShowAdmin(data.isAdmin))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || undefined,
          email: firebaseUser.email || undefined,
          photoUrl: firebaseUser.photoURL || undefined,
        });
      }
    });
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    await signOut(getFirebaseAuth()).catch(() => {});
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/benchmarks" className="flex items-center gap-2.5 shrink-0">
            <Image src="/logo-icon.svg" alt="" width={24} height={24} className="rounded-md" />
            <span className="text-[15px] font-semibold tracking-tight">
              Captable<span className="text-primary">BR</span>
            </span>
          </Link>

          {/* Center nav — floating pill */}
          <nav className="flex items-center bg-foreground/[0.04] rounded-full p-0.5 gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    isActive
                      ? "bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {showAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "px-4 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  pathname.startsWith("/admin")
                    ? "bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <UserAvatar name={user?.name} photoUrl={user?.photoUrl} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user?.email && (
                <>
                  <div className="px-2 py-2">
                    {user.name && (
                      <p className="text-sm font-medium truncate">{user.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href="/my-data" className="cursor-pointer">
                  Meus Dados
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-muted-foreground">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Subtle separator */}
      <div className="h-px bg-foreground/[0.06]" />
    </header>
  );
}
