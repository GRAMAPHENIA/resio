import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Administración - RESIO",
  description: "Panel de control para gestionar propiedades y reservas en RESIO Alojamientos.",
  icons: {
    icon: "/resio-logo-32.svg",
    shortcut: "/resio-logo-32.svg",
    apple: "/resio-logo-32.svg",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}