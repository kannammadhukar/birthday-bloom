import type { Metadata, Viewport } from "next";
import "./globals.css";
import GlobalButterflyTheme from "@/components/GlobalButterflyTheme";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Happy Birthday Divija! 👑🌸✨",
  description: "A magical 3D birthday surprise experience crafted with love!",
  openGraph: {
    title: "Happy Birthday Divija! 👑✨",
    description: "A magical 3D birthday universe — just for you.",
    images: ["/images/photo_25.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalButterflyTheme />
        {children}
      </body>
    </html>
  );
}
