import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  
  // Use environment variable for base URL, fallback to production URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clienteresio.vercel.app';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // For errors, redirect to registration page
  return NextResponse.redirect(`${baseUrl}/registro`);
}
