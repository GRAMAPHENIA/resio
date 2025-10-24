import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  
  // Use environment variable for base URL, fallback to production URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clienteresio.vercel.app';
  
  // Debug logging (remove after fixing)
  console.log('🔍 Auth Callback Debug:');
  console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
  console.log('baseUrl:', baseUrl);
  console.log('request.url:', request.url);
  console.log('code:', code);
  console.log('next:', next);

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
