"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InputMode } from "@/lib/types";

interface EquityInputProps {
  inputMode: InputMode;
  equityPercentage?: number;
  numberOfShares?: number;
  totalSharesOutstanding?: number;
  currentSharePrice?: number;
  lastValuation?: number;
  onInputModeChange: (mode: InputMode) => void;
  onEquityPercentageChange: (value: number | undefined) => void;
  onNumberOfSharesChange: (value: number | undefined) => void;
  onTotalSharesOutstandingChange: (value: number | undefined) => void;
  onCurrentSharePriceChange: (value: number | undefined) => void;
  onLastValuationChange: (value: number | undefined) => void;
}

export function EquityInput({
  inputMode,
  equityPercentage,
  numberOfShares,
  totalSharesOutstanding,
  currentSharePrice,
  lastValuation,
  onInputModeChange,
  onEquityPercentageChange,
  onNumberOfSharesChange,
  onTotalSharesOutstandingChange,
  onCurrentSharePriceChange,
  onLastValuationChange,
}: EquityInputProps) {
  const [showValuation, setShowValuation] = useState(
    currentSharePrice != null || lastValuation != null
  );

  // Compute percentage from available data
  let computedPercentage: number | null = null;
  if (numberOfShares && totalSharesOutstanding && totalSharesOutstanding > 0) {
    computedPercentage = (numberOfShares / totalSharesOutstanding) * 100;
  } else if (numberOfShares && lastValuation && currentSharePrice && currentSharePrice > 0) {
    const derivedTotal = lastValuation / currentSharePrice;
    computedPercentage = (numberOfShares / derivedTotal) * 100;
  }

  const sharesExceedTotal =
    numberOfShares != null && totalSharesOutstanding != null && numberOfShares > totalSharesOutstanding;

  const percentageOutOfBounds =
    computedPercentage != null && (computedPercentage < 0.001 || computedPercentage > 30);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Modo de entrada *</Label>
        <RadioGroup
          value={inputMode}
          onValueChange={(v) => onInputModeChange(v as InputMode)}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="percentage" id="mode-pct" />
            <Label htmlFor="mode-pct" className="cursor-pointer font-normal">Percentual (%)</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="shares" id="mode-shares" />
            <Label htmlFor="mode-shares" className="cursor-pointer font-normal">Número de ações</Label>
          </div>
        </RadioGroup>
      </div>

      {inputMode === "percentage" ? (
        <div className="space-y-2">
          <Label>Equity total (%) *</Label>
          <Input
            type="number"
            step="0.001"
            min="0.001"
            max="30"
            value={equityPercentage ?? ""}
            onChange={(e) => onEquityPercentageChange(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Ex: 1.5"
            className="h-11"
            required
          />
          {(equityPercentage ?? 0) > 10 && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              Valor acima de 10% — verifique se está correto
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ações recebidas *</Label>
              <Input
                type="number"
                min="1"
                value={numberOfShares ?? ""}
                onChange={(e) => onNumberOfSharesChange(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ex: 50000"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Total de ações (fully diluted)</Label>
              <Input
                type="number"
                min="1"
                value={totalSharesOutstanding ?? ""}
                onChange={(e) => onTotalSharesOutstandingChange(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ex: 10000000"
                className="h-11"
              />
            </div>
          </div>

          {/* Collapsible valuation section */}
          {!showValuation ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowValuation(true)}
            >
              + Valuation (opcional)
            </Button>
          ) : (
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valuation (opcional)</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => {
                    setShowValuation(false);
                    onCurrentSharePriceChange(undefined);
                    onLastValuationChange(undefined);
                  }}
                >
                  Remover
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço atual da ação / FMV (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={currentSharePrice ?? ""}
                    onChange={(e) => onCurrentSharePriceChange(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ex: 12.50"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Último valuation da empresa (R$)</Label>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    value={lastValuation ?? ""}
                    onChange={(e) => onLastValuationChange(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ex: 50000000"
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {sharesExceedTotal && (
            <p className="text-xs text-destructive">
              Número de ações não pode exceder o total outstanding
            </p>
          )}
          {percentageOutOfBounds && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              Percentual calculado fora do intervalo esperado (0.001%-30%) — será tratado como indefinido
            </p>
          )}
          {computedPercentage != null && !sharesExceedTotal && !percentageOutOfBounds && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              = {computedPercentage.toFixed(4)}% do cap table
            </Badge>
          )}
          {computedPercentage != null && computedPercentage > 10 && !sharesExceedTotal && !percentageOutOfBounds && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              Valor acima de 10% — verifique se está correto
            </p>
          )}
          {numberOfShares && computedPercentage == null && !sharesExceedTotal && (
            <p className="text-xs text-muted-foreground">
              Adicione o total de ações ou valuation para calcular o percentual
            </p>
          )}
        </div>
      )}
    </div>
  );
}
