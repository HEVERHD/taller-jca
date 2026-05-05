"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { loginAction } from "@/actions/auth";
import { Eye, EyeOff, LogIn, Wrench } from "lucide-react";

export function LoginForm({ defaultUsername }: { defaultUsername: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('/fondoMecanica.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/60 to-zinc-900/80" />

      {/* Partícula decorativa top-left */}
      <div className="absolute top-8 left-8 hidden md:flex items-center gap-2 opacity-30">
        <Wrench className="w-5 h-5 text-orange-400" />
        <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">
          Sistema de Gestión
        </span>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-7">
          <Image
            src="/logo.png"
            alt="Jhan Carlos Arias"
            width={320}
            height={80}
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Glassmorphism card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-7 shadow-2xl space-y-5">

          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Bienvenido</h1>
            <p className="text-sm text-white/60 mt-0.5">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80 block">
                Usuario
              </label>
              <input
                name="username"
                type="text"
                placeholder="admin"
                autoComplete="username"
                defaultValue={defaultUsername}
                required
                autoFocus={!defaultUsername}
                className="w-full h-10 rounded-lg bg-white/10 border border-white/20 px-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80 block">
                Contraseña
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  autoFocus={!!defaultUsername}
                  className="w-full h-10 rounded-lg bg-white/10 border border-white/20 px-3 pr-10 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Recordar sesión */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  defaultChecked={!!defaultUsername}
                  className="peer w-4 h-4 rounded border border-white/30 bg-white/10 appearance-none cursor-pointer checked:bg-orange-500 checked:border-orange-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
                {/* checkmark */}
                <svg
                  className="absolute inset-0 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3.5 8l3 3 6-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors select-none">
                Recordar usuario y contraseña
              </span>
            </label>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-300 text-center font-medium bg-red-500/15 rounded-lg py-2">
                {error}
              </p>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/30 mt-1"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isPending ? "Entrando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/30 mt-5">
          Taller Jhan Carlos Arias · Latonería y Pintura
        </p>
      </div>
    </div>
  );
}
