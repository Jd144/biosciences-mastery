import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BioSciences Mastery — GAT-B Prep Platform",
  description: "India's best GAT-B preparation platform. Master Biochemistry, Microbiology, Cell Biology, Genetics, Immunology and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">{children}</body>
    </html>
  );
}
