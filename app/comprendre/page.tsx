"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ComprendreRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/#sources");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-xs text-ink-muted">
      Redirection vers le tableau de bord…
    </div>
  );
}
