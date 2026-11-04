import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/lib/theme";
import { VoiceProvider } from "@/lib/voice";
import { FlightCanvas } from "@/components/FlightCanvas";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "EngineWatch | Aerospace Predictive Maintenance Intelligence",
  description: "Commercial-grade aerospace intelligence platform for Remaining Useful Life (RUL) estimation and condition monitoring of aircraft turbofan engines.",
  icons: {
    icon: "/assets/logo.png",
    shortcut: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="theme-dark dark" suppressHydrationWarning>
      <body className="bg-theme-bg text-theme-textPrimary antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <ThemeProvider>
          <VoiceProvider>
            {/* Persistent Flight Experience: Animated Jet traversing viewport */}
            <FlightCanvas />
            
            <div className="relative min-h-screen flex flex-col z-10">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </VoiceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

