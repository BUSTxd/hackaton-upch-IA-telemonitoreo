import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ASISTENTE } from "@/config/marca";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${ASISTENTE} · Recopilación de datos en campo`,
  description:
    "El trabajador de salud graba la entrevista familiar, la IA transcribe y ordena los datos en la ficha, y la persona los revisa y confirma. Hackatón UPCH.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
