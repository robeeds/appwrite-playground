"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface Signup1Props {
  heading?: string;
  logo: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  buttonText?: string;
  googleText?: string;
  signupText?: string;
  signupUrl?: string;

  /* UI state & handlers supplied by the page */
  loading?: boolean;
  /* Map of field errors */
  errors?: Record<string, string[]>;
  onSubmit: (vals: {
    name?: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
}

const Signup1 = ({
  heading = "Signup",
  logo = {
    url: "/",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-wordmark.svg",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  buttonText = "Create Account",
  signupText = "Already a user?",
  signupUrl = "/login",
  loading = false,
  errors,
  onSubmit,
}: Signup1Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fieldError = (key: string) => errors?.[key]?.[0] ?? "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name: name, email, password, confirmPassword });
  }

  return (
    <section className="bg-muted h-screen">
      <div className="flex h-full items-center justify-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-6 lg:justify-start">
          <a href={logo.url}>
            <Image
              src={logo.src}
              alt={logo.alt}
              title={logo.title}
              className="h-10 dark:invert"
            />
          </a>
          <form
            onSubmit={handleSubmit}
            className="min-w-sm border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md"
          >
            {heading && <h1 className="text-xl font-semibold">{heading}</h1>}

            <div className="w-full">
              <Input
                type="text"
                placeholder="Name"
                className="text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                aria-invalid={!!fieldError("name")}
                required
              />
              {fieldError("name") && (
                <p className="text-xs text-destructive mt-1">
                  {fieldError("name")}
                </p>
              )}
            </div>

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

            <div className="w-full">
              <Input
                type="password"
                placeholder="Confirm Password"
                className="text-sm"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                aria-invalid={!!fieldError("confirm")}
              />
              {fieldError("confirm") && (
                <p className="text-xs text-destructive mt-1">
                  {fieldError("confirm")}
                </p>
              )}
            </div>

            {fieldError("form") && (
              <p
                className="text-sm text-destructive w-full"
                role="alert"
                aria-live="polite"
              >
                {fieldError("form")}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : buttonText}
            </Button>
          </form>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>{signupText}</p>
            <a
              href={signupUrl}
              className="text-primary font-medium hover:underline"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Signup1 };
