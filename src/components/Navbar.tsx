"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import {
  FaUserInjured,
  FaUserDoctor,
  FaShieldHalved,
  FaSun,
  FaMoon,
  FaHeartPulse,
} from "react-icons/fa6";

const navLinks = [
  { href: "/patient", label: "Patient", icon: FaUserInjured },
  { href: "/doctor", label: "Doctor", icon: FaUserDoctor },
  { href: "/admin", label: "Admin", icon: FaShieldHalved },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-brand)" }}
            >
              <FaHeartPulse className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-semibold text-base tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Prescripto
              <span style={{ color: "var(--color-brand)" }}>AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? "var(--color-brand-subtle)"
                      : "transparent",
                    color: isActive
                      ? "var(--color-brand)"
                      : "var(--color-text-secondary)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {mounted ? (
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                onPress={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-lg"
              >
                {theme === "dark" ? (
                  <FaSun
                    className="w-4 h-4"
                    style={{ color: "var(--color-text-secondary)" }}
                  />
                ) : (
                  <FaMoon
                    className="w-4 h-4"
                    style={{ color: "var(--color-text-secondary)" }}
                  />
                )}
              </Button>
            ) : (
              <div className="w-8 h-8" />
            )}

            <button
              className="md:hidden p-2 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className="block h-0.5 rounded"
                  style={{ backgroundColor: "currentColor" }}
                />
                <span
                  className="block h-0.5 rounded"
                  style={{ backgroundColor: "currentColor" }}
                />
                <span
                  className="block h-0.5 rounded"
                  style={{ backgroundColor: "currentColor" }}
                />
              </div>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-3 pt-2 flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? "var(--color-brand-subtle)"
                      : "transparent",
                    color: isActive
                      ? "var(--color-brand)"
                      : "var(--color-text-secondary)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
