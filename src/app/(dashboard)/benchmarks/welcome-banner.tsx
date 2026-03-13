"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const DISMISS_KEY = "captablebr_welcome_dismissed";

export function WelcomeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISS_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-primary/[0.04] px-6 py-5">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground/60 hover:text-muted-foreground hover:bg-foreground/5 transition-colors"
        aria-label="Fechar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      <div className="flex items-start gap-4 pr-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <div className="space-y-2">
          <p className="text-[15px] font-medium text-foreground leading-snug">
            Benchmarks do mercado brasileiro em breve
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Estamos começando com dados de referência do mercado norte-americano enquanto coletamos informações de executivos de startups brasileiras. Nas próximas semanas, conforme mais dados forem enviados, vamos gerar benchmarks locais com dados reais do Brasil. Você será notificado quando estiverem disponíveis.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Button asChild size="sm" className="rounded-full text-[13px] h-8">
              <Link href="/submit">Contribuir com meus dados</Link>
            </Button>
            <button
              onClick={dismiss}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
