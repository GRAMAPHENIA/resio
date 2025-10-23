import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Always redirect to production URL
      const baseUrl = 'https://clienteresio.vercel.app';
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // For errors, redirect to registration page
  const baseUrl = 'https://clienteresio.vercel.app';
  return NextResponse.redirect(`${baseUrl}/registro`);
}
