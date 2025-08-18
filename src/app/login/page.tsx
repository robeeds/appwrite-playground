"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Login1 } from "@/components/login1";
import {
  getCurrentUser,
  loginWithEmail,
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

  async function handleSubmit(vals: { email: string; password: string }) {
    setLoading(true);
    setErrors(null);

    const result = await loginWithEmail(vals);
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
      <Login1
        logo={{
          url: "/",
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-wordmark.svg",
          alt: "logo",
          title: "Appwrite Playground",
        }}
        signupUrl="/signup"
        onSubmit={handleSubmit}
        loading={loading}
        errors={errors ?? undefined}
      />
    </div>
  );
}
