"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getUserAvatar } from "@/lib/appwrite";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<
    { id: string; name: string; email: string } | undefined
  >(undefined);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    getCurrentUser().then((user) => {
      if (!user) {
        router.push("login");
      } else {
        setUser({
          id: user.$id,
          name: user.name,
          email: user.email,
        });

        getUserAvatar(user.name).then((avatarUrl) => {
          setAvatar(avatarUrl);
        });
      }
    });
  }, [router]);
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {user && <AppSidebar variant="inset" user={user} avatar={avatar} />}
      <SidebarInset>
        <SiteHeader />
        <div>
          <p>This is the dashboard</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
