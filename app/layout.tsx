import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ROTEX · Rehabilitasi Bahu", template: "%s · ROTEX" },
  description: "Rotation Therapy Exercise, alat rehabilitasi bahu dengan platform pendamping untuk pencatatan terapi dan pemantauan rentang gerak.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body>
        <a className="skip-link" href="#konten">Lewati ke konten utama</a>
        {children}
      </body>
    </html>
  );
}
