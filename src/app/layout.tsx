import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import ClientLayout from "@/components/layout/client-layout";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: "400",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: "400",
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
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <ClientLayout user={serializedUser}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
