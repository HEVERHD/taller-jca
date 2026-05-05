"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Car, Wrench, TrendingUp, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

const links = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/clientes",  label: "Clientes",   icon: Users },
  { href: "/vehiculos", label: "Vehículos",  icon: Car },
  { href: "/servicios", label: "Servicios",  icon: Wrench },
  { href: "/ingresos",  label: "Ingresos",   icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-zinc-950 text-white z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Image
            src="/logo2.png"
            alt="Taller JCA"
            width={44}
            height={44}
            className="rounded-xl object-contain shrink-0"
          />
          <div>
            <p className="font-bold text-sm leading-tight text-white">Jhan Carlos Arias</p>
            <p className="text-xs text-zinc-400 leading-tight mt-0.5">Latonería y Pintura</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-3 mb-3">
          Menú
        </p>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-900/40"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-800 space-y-3">
        <div className="flex items-center gap-2 px-3">
          <div className="w-2 h-2 bg-green-400 rounded-full shrink-0" />
          <p className="text-xs text-zinc-500">Sistema activo · v1.0</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
