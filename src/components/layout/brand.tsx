import Link from "next/link";
import { Activity } from "lucide-react";

export function Brand() {
  return (
    <Link aria-label="ROTEX, beranda" className="brand" href="/">
      <span className="brand-mark"><Activity size={22} strokeWidth={2} aria-hidden="true" /></span>
      <span>ROTEX</span>
    </Link>
  );
}
