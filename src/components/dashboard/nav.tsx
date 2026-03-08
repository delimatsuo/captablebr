"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/submit", label: "Minha Compensação" },
  { href: "/my-data", label: "Meus Dados" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((data) => setShowAdmin(data.isAdmin))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    await signOut(getFirebaseAuth()).catch(() => {});
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/benchmarks" className="flex items-center gap-2.5 py-3">
            <Image src="/logo-icon.svg" alt="" width={28} height={28} className="rounded-lg" />
            <span className="text-base font-bold tracking-tight hidden sm:inline">
              Captable<span className="text-primary">BR</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 pb-[calc(0.75rem+2px)] pt-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent",
                    isActive && "border-primary text-foreground"
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
                  "px-3 pb-[calc(0.75rem+2px)] pt-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent",
                  pathname.startsWith("/admin") && "border-primary text-foreground"
                )}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
