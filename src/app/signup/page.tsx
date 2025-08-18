"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Signup1 } from "@/components/signup1";
import {
  getCurrentUser,
  registerAndLogin,
  type ValidationErrorMap,
} from "@/lib/appwrite";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrorMap | null>(null);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    getCurrentUser().then((user) => {
      if (user) {
        router.push("dashboard");
      }
    });
  }, [router]);

  async function handleSubmit(vals: {
    name?: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    setLoading(true);
    setErrors(null);

    const result = await registerAndLogin(vals);
    setLoading(false);

    if (!result.ok) {
      // Either structured field errors or a single message
      return setErrors(
        result.errors ?? { form: [result.message || "Something went wrong"] }
      );
    }

    // Signed up + logged in successfully
    router.push("dashboard");
  }
  return (
    <div>
      <Signup1
        logo={{
          url: "/",
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-wordmark.svg",
          alt: "Appwrite Playground Logo",
        }}
        signupUrl="/login"
        onSubmit={handleSubmit}
        loading={loading}
        errors={errors ?? undefined}
      />
    </div>
  );
}
