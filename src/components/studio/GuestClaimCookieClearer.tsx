"use client";

import { useEffect } from "react";

export default function GuestClaimCookieClearer() {
  useEffect(() => {
    void fetch("/api/guest/claim", { method: "POST" });
  }, []);

  return null;
}
