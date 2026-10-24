import { Bricolage_Grotesque, Space_Mono } from "next/font/google";
import "@/styles/dashboard-neo.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`dashboard-neo ${bricolage.variable} ${spaceMono.variable}`}>
      {children}
    </div>
  );
}
