"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Users, Car, Wrench, TrendingUp, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { PushBell } from "@/components/pwa/push-bell";
import { logoutAction } from "@/actions/auth";

const links = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/clientes",  label: "Clientes",   icon: Users },
  { href: "/vehiculos", label: "Vehículos",  icon: Car },
  { href: "/servicios", label: "Servicios",  icon: Wrench },
  { href: "/ingresos",  label: "Ingresos",   icon: TrendingUp },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 h-17 bg-zinc-950 text-white flex items-center justify-between px-4 z-40 border-b border-zinc-800">
        <Link href="/dashboard">
          <Image
            src="/logo.png"
            alt="Taller JCA"
            width={240}
            height={60}
            className="object-contain"
          />
        </Link>
        <div className="flex items-center gap-1">
          <PushBell className="p-2 rounded-lg hover:bg-zinc-800 transition-colors" />
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 pt-14">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <nav className="relative bg-zinc-950 text-white w-64 h-full px-3 py-5 flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-3 mb-3">
              Menú
            </p>
            <div className="space-y-0.5 flex-1">
              {links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-orange-500 text-white shadow-sm shadow-orange-900/40"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-zinc-800 pt-3 mt-3">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
