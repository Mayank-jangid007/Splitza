"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/landing");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6C47FF] border-t-transparent"></div>
    </div>
  );
}