"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface Login1Props {
  heading?: string;
  logo: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  buttonText?: string;
  signupText?: string;
  signupUrl?: string;

  /* UI state & handlers supplied by the page */
  loading?: boolean;
  /* Map of field errors */
  errors?: Record<string, string[]>;
  onSubmit: (vals: { name?: string; email: string; password: string }) => void;
}

const Login1 = ({
  heading = "Login",
  logo = {
    url: "/",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-wordmark.svg",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  buttonText = "Login",
  signupText = "Need an account?",
  signupUrl = "https://shadcnblocks.com",
  loading = false,
  errors,
  onSubmit,
}: Login1Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fieldError = (key: string) => errors?.[key]?.[0] ?? "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ email, password });
  }

  return (
    <section className="bg-muted h-screen">
      <div className="flex h-full items-center justify-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-6 lg:justify-start">
          {logo ? (
            <a href={logo.url}>
              <Image
                width={0}
                height={0}
                src={logo.src}
                alt={logo.alt}
                title={logo.title}
                className="h-10 dark:invert"
              />
            </a>
          ) : (
            <></>
          )}
          <form
            onSubmit={handleSubmit}
            className="min-w-sm border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md"
          >
            {heading && <h1 className="text-xl font-semibold">{heading}</h1>}
            <div className="w-full">
              <Input
                type="email"
                placeholder="Email"
                className="text-sm"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-invalid={!!fieldError("email")}
              />
              {fieldError("email") && (
                <p className="text-xs text-destructive mt-1">
                  {fieldError("email")}
                </p>
              )}
            </div>

            <div className="w-full">
              <Input
                type="password"
                placeholder="Password"
                className="text-sm"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="password"
                minLength={8}
                aria-invalid={!!fieldError("password")}
              />
              {fieldError("password") && (
                <p className="text-xs text-destructive mt-1">
                  {fieldError("password")}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : buttonText}
            </Button>
          </form>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>{signupText}</p>
            <a
              href={signupUrl}
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Login1 };
