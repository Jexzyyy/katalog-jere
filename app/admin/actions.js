"use server";

import { redirect } from "next/navigation";
import { buatClientAuth } from "@/lib/supabase/server";

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email dan password harus diisi." };
  }

  const supabase = await buatClientAuth();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email atau password salah." };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await buatClientAuth();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
