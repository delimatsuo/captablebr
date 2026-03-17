"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GrantForm } from "./grant-form";
import type { GrantFormData } from "@/lib/validations";

interface Props {
  grants: Partial<GrantFormData>[];
  onChange: (grants: Partial<GrantFormData>[]) => void;
  currency?: string;
}

function equitySummaryForGrant(g: Partial<GrantFormData>): string {
  if (g.inputMode === "shares" && g.numberOfShares) {
    const sharesStr = g.numberOfShares.toLocaleString("pt-BR");
    let pct: number | null = null;
    if (g.totalSharesOutstanding && g.totalSharesOutstanding > 0) {
      pct = (g.numberOfShares / g.totalSharesOutstanding) * 100;
    } else if (g.lastValuation && g.currentSharePrice && g.currentSharePrice > 0) {
      pct = (g.numberOfShares / (g.lastValuation / g.currentSharePrice)) * 100;
    }
    if (pct != null && pct >= 0.001 && pct <= 30) {
      return `${sharesStr} ações (${pct.toFixed(4)}%)`;
    }
    return `${sharesStr} ações`;
  }
  return g.equityPercentage != null ? `${g.equityPercentage}%` : "—";
}

function vestingSummary(g: Partial<GrantFormData>): string {
  const parts: string[] = [];
  if (g.vestingTotalMonths != null) parts.push(`${g.vestingTotalMonths}m`);
  if (g.cliffMonths != null) parts.push(`cliff ${g.cliffMonths}m`);
  return parts.join(", ") || "—";
}

export function GrantList({ grants, onChange, currency }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  function handleSave(index: number, data: Partial<GrantFormData>) {
    const updated = [...grants];
    updated[index] = data;
    onChange(updated);
    setEditingIndex(null);
  }

  function handleAdd(data: Partial<GrantFormData>) {
    // If the only existing grant is the empty placeholder, replace it
    if (grants.length === 1 && !grants[0].instrumentType && grants[0].equityPercentage == null && grants[0].numberOfShares == null) {
      onChange([data]);
    } else {
      onChange([...grants, data]);
    }
    setIsAdding(false);
  }

  function handleDelete(index: number) {
    onChange(grants.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      {grants.map((grant, index) => (
        <Card key={index} className="relative">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-sm">
                    {grant.grantLabel || `Grant ${index + 1}`}
                  </h3>
                  {grant.instrumentType && (
                    <Badge variant="secondary" className="text-xs">{grant.instrumentType}</Badge>
                  )}
                  {grant.grantType && (
                    <Badge variant="outline" className="text-xs">{grant.grantType}</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span>Equity: {equitySummaryForGrant(grant)}</span>
                  <span>Vesting: {vestingSummary(grant)}</span>
                  {grant.vestingSchedule && <span>{grant.vestingSchedule}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingIndex(index)}
                  className="h-8 px-3 text-xs"
                >
                  Editar
                </Button>
                {grants.length > 1 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover grant?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover &ldquo;{grant.grantLabel || `Grant ${index + 1}`}&rdquo;?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(index)}>
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => setIsAdding(true)}
        className="w-full h-11 gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Adicionar grant
      </Button>

      {/* Edit sheet */}
      <Sheet open={editingIndex !== null} onOpenChange={(open) => { if (!open) setEditingIndex(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar grant</SheetTitle>
            <SheetDescription>Atualize os dados deste grant</SheetDescription>
          </SheetHeader>
          {editingIndex !== null && (
            <div className="px-4 pb-4">
              <GrantForm
                data={grants[editingIndex]}
                onSave={(data) => handleSave(editingIndex, data)}
                onCancel={() => setEditingIndex(null)}
                defaultCurrency={currency}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add sheet */}
      <Sheet open={isAdding} onOpenChange={(open) => { if (!open) setIsAdding(false); }}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Adicionar grant</SheetTitle>
            <SheetDescription>Preencha os dados do novo grant</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <GrantForm
              data={{ inputMode: "percentage", isFirstInRole: false }}
              onSave={handleAdd}
              onCancel={() => setIsAdding(false)}
              defaultCurrency={currency}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
