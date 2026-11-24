"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PreuveRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/#modele");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-xs text-ink-muted">
      Redirection vers le tableau de bord…
    </div>
  );
}
