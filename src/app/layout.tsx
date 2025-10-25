import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import ClientLayout from "@/components/layout/client-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RESIO Alojamientos - Reserva tu estadía",
  description: "Encuentra y reserva el alojamiento perfecto para tus vacaciones. Sistema simple y seguro de reservas online.",
  icons: {
    icon: "/resio-logo.png",
    shortcut: "/resio-logo.png",
    apple: "/resio-logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Serializar el usuario para evitar problemas de hidratación
  const serializedUser = user ? {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
    created_at: user.created_at
  } : null;

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayout user={serializedUser}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
