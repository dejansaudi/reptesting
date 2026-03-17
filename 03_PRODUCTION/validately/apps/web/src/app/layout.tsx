import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata = {
  title: "Validately — Validate Your Startup Idea",
  description:
    "7-stage AI-powered startup validation platform. From raw idea to investor-ready in weeks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-content font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
