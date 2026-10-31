import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ASISTENTE } from "@/config/marca";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${ASISTENTE} · Telemonitoreo con IA de voz`,
  description:
    "El personal de salud dicta los datos del paciente, la IA completa la ficha y las reglas ordenan los casos por prioridad clínica. Hackatón UPCH.",
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
