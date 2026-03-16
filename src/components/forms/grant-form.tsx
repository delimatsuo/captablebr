"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectItemWithDescription, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EquityInput } from "./equity-input";
import {
  INSTRUMENT_TYPES, VESTING_SCHEDULES, GRANT_TYPES,
  CURRENCIES,
  type InputMode,
} from "@/lib/types";
import type { GrantFormData } from "@/lib/validations";

const INSTRUMENT_DESCRIPTIONS: Record<string, string> = {
  "Stock Options": "Direito de comprar ações a um preço pré-definido (strike price)",
  "Phantom Stock": "Bônus em dinheiro atrelado ao valor das ações, sem participação societária real",
  "RSU": "Ações restritas concedidas que vestem ao longo do tempo",
  "Partnership Quotas (Cotas)": "Participação societária direta em cotas da empresa (modelo Ltda.)",
  "SAR": "Stock Appreciation Rights — direito de receber a valorização das ações em dinheiro",
  "Vesting Shares": "Ações adquiridas progressivamente conforme cronograma de vesting",
  "Other": "Outro instrumento de equity",
};

const GRANT_TYPE_DESCRIPTIONS: Record<string, string> = {
  "New-hire": "Primeiro grant recebido ao entrar na empresa",
  "Ongoing/Refresh": "Grant adicional para retenção ou renovação",
  "Promotion": "Grant recebido por promoção de cargo",
};

const VESTING_SCHEDULE_DESCRIPTIONS: Record<string, string> = {
  "Monthly after cliff": "Vesting mensal após o período de cliff",
  "Quarterly after cliff": "Vesting trimestral após o período de cliff",
  "Annual": "Vesting anual em parcelas iguais",
  "Cliff only (all at once)": "100% do equity liberado de uma vez ao final do cliff",
  "Other": "Outro cronograma de vesting",
};

interface Props {
  data: Partial<GrantFormData>;
  onSave: (data: Partial<GrantFormData>) => void;
  onCancel: () => void;
  defaultCurrency?: string;
}

export function GrantForm({ data: initialData, onSave, onCancel, defaultCurrency = "USD" }: Props) {
  const [data, setData] = useState<Partial<GrantFormData>>({
    inputMode: "percentage",
    isFirstInRole: false,
    strikeCurrency: defaultCurrency as GrantFormData["strikeCurrency"],
    ...initialData,
  });

  function update(field: keyof GrantFormData, value: unknown) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function canSave() {
    const hasEquity = data.inputMode === "shares"
      ? data.numberOfShares != null
      : data.equityPercentage != null;
    const needsStrike = data.instrumentType === "Stock Options" || data.instrumentType === "SAR";
    const hasStrike = !needsStrike || data.strikePrice != null;
    return (
      data.instrumentType &&
      hasEquity &&
      hasStrike &&
      data.vestingTotalMonths != null &&
      data.cliffMonths != null &&
      data.vestingSchedule &&
      data.grantType
    );
  }

  return (
    <div className="space-y-6">
      {/* Instrument & equity */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Instrumento *</Label>
            <Select value={data.instrumentType} onValueChange={(v) => update("instrumentType", v)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {INSTRUMENT_TYPES.map((i) => (
                  <SelectItemWithDescription key={i} value={i} textValue={i} label={i} description={INSTRUMENT_DESCRIPTIONS[i]} className="py-2.5" />
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Grant *</Label>
            <Select value={data.grantType} onValueChange={(v) => update("grantType", v)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {GRANT_TYPES.map((g) => (
                  <SelectItemWithDescription key={g} value={g} textValue={g} label={g} description={GRANT_TYPE_DESCRIPTIONS[g]} className="py-2.5" />
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <EquityInput
          inputMode={(data.inputMode as InputMode) || "percentage"}
          equityPercentage={data.equityPercentage}
          numberOfShares={data.numberOfShares}
          totalSharesOutstanding={data.totalSharesOutstanding}
          currentSharePrice={data.currentSharePrice}
          lastValuation={data.lastValuation}
          onInputModeChange={(mode) => update("inputMode", mode)}
          onEquityPercentageChange={(v) => update("equityPercentage", v)}
          onNumberOfSharesChange={(v) => update("numberOfShares", v)}
          onTotalSharesOutstandingChange={(v) => update("totalSharesOutstanding", v)}
          onCurrentSharePriceChange={(v) => update("currentSharePrice", v)}
          onLastValuationChange={(v) => update("lastValuation", v)}
        />

        {/* Strike price — conditional on Stock Options or SAR */}
        {(data.instrumentType === "Stock Options" || data.instrumentType === "SAR") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Preço de exercício (strike price) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={data.strikePrice ?? ""}
                onChange={(e) => update("strikePrice", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ex: 1.50"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Moeda do strike</Label>
              <Select value={data.strikeCurrency || defaultCurrency} onValueChange={(v) => update("strikeCurrency", v)}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Grant metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Data do grant</Label>
            <Input
              type="date"
              value={data.grantDate instanceof Date ? data.grantDate.toISOString().split("T")[0] : String(data.grantDate || "").split("T")[0]}
              onChange={(e) => update("grantDate", e.target.value || undefined)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Rótulo do grant</Label>
            <Input
              value={data.grantLabel || ""}
              onChange={(e) => update("grantLabel", e.target.value || undefined)}
              placeholder="Ex: New-hire grant 2024"
              className="h-11"
              maxLength={100}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Vesting */}
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Vesting</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label>Período Total (meses) *</Label>
            <Input
              type="number"
              min="1"
              max="120"
              value={data.vestingTotalMonths ?? ""}
              onChange={(e) => update("vestingTotalMonths", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Ex: 48"
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Cliff (meses) *</Label>
            <Input
              type="number"
              min="0"
              max="48"
              value={data.cliffMonths ?? ""}
              onChange={(e) => update("cliffMonths", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Ex: 12"
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Cronograma *</Label>
            <Select value={data.vestingSchedule} onValueChange={(v) => update("vestingSchedule", v)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {VESTING_SCHEDULES.map((s) => (
                  <SelectItemWithDescription key={s} value={s} textValue={s} label={s} description={VESTING_SCHEDULE_DESCRIPTIONS[s]} className="py-2.5" />
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* First in role */}
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <Checkbox
          id="grantIsFirstInRole"
          checked={data.isFirstInRole || false}
          onCheckedChange={(v) => update("isFirstInRole", v === true)}
        />
        <div>
          <Label htmlFor="grantIsFirstInRole" className="font-medium cursor-pointer">
            Primeira contratação externa para este cargo
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selecione se você foi o primeiro executivo contratado do mercado para esta posição neste grant
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-6">
          Cancelar
        </Button>
        <Button type="button" onClick={() => onSave(data)} disabled={!canSave()} className="h-11 px-6">
          Salvar grant
        </Button>
      </div>
    </div>
  );
}
