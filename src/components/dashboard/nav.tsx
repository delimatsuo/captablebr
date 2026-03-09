"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/submit", label: "Compensação" },
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
                    ? "bg-white text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-200 shrink-0 rounded-full px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            Sair
          </button>
        </div>
      </div>
      {/* Subtle separator */}
      <div className="h-px bg-foreground/[0.06]" />
    </header>
  );
}
