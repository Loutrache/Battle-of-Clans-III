"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function HeaderAuthLink() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  setIsLoggedIn(!!user);

  if (!user) {
    setUserRole(null);
    return;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  setUserRole(profileData?.role ?? null);
}

    checkUser();
  }, []);

  if (!isLoggedIn) return null;

  return (
    <Link
      href={userRole === "oracle" ? "/mon-espace-oracle" : "/mon-espace"}
      className="rounded-full bg-[#6163FC] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#7b7dff]"
    >
      Mon espace
    </Link>
  );
}