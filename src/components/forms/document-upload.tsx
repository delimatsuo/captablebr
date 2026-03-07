"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import type { SubmissionFormData } from "@/lib/validations";

interface Props {
  onExtracted: (data: Partial<SubmissionFormData>, objectName: string) => void;
}

export function DocumentUpload({ onExtracted }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [consent, setConsent] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(f.type)) {
      toast.error("Tipo de arquivo não permitido. Use PDF, PNG, JPEG ou WebP.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo de 10MB.");
      return;
    }
    setFile(f);
  }, []);

  async function handleUploadAndExtract() {
    if (!file || !consent) return;

    setUploading(true);
    setProgress(20);

    try {
      // 1. Get signed URL
      const urlRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Falha ao gerar URL de upload");
      const { signedUrl, objectName } = await urlRes.json();
      setProgress(40);

      // 2. Upload file
      await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      setProgress(60);

      // 3. Extract with AI
      setUploading(false);
      setExtracting(true);
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectName, contentType: file.type }),
      });
      if (!extractRes.ok) throw new Error("Falha na extração");
      const extracted = await extractRes.json();
      setProgress(100);

      // Map API response to form data
      const mapped: Partial<SubmissionFormData> = {};
      if (extracted.role) mapped.role = extracted.role as SubmissionFormData["role"];
      if (extracted.instrument_type) mapped.instrumentType = extracted.instrument_type as SubmissionFormData["instrumentType"];
      if (extracted.equity_percentage) mapped.equityPercentage = extracted.equity_percentage;
      if (extracted.vesting_total_months) mapped.vestingTotalMonths = extracted.vesting_total_months;
      if (extracted.cliff_months != null) mapped.cliffMonths = extracted.cliff_months;
      if (extracted.vesting_schedule) mapped.vestingSchedule = extracted.vesting_schedule as SubmissionFormData["vestingSchedule"];
      if (extracted.grant_type) mapped.grantType = extracted.grant_type as SubmissionFormData["grantType"];
      if (extracted.stage) mapped.stage = extracted.stage as SubmissionFormData["stage"];
      if (extracted.sector) mapped.sector = extracted.sector as SubmissionFormData["sector"];
      if (extracted.number_of_shares) {
        mapped.numberOfShares = extracted.number_of_shares;
        mapped.inputMode = "shares";
      }
      if (extracted.total_shares_outstanding) mapped.totalSharesOutstanding = extracted.total_shares_outstanding;
      if (extracted.strike_price) mapped.strikePrice = extracted.strike_price;
      if (extracted.grant_date) mapped.grantDate = extracted.grant_date;

      onExtracted(mapped, objectName);
      toast.success(`Dados extraídos com confiança de ${Math.round((extracted.confidence || 0) * 100)}%`);
    } catch {
      toast.error("Erro no processamento do documento");
    } finally {
      setUploading(false);
      setExtracting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload de Contrato</CardTitle>
        <CardDescription>
          Envie o contrato ou política de equity para extração automática via IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="relative">
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(1)} MB — Clique para trocar
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium">Clique para selecionar um arquivo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, PNG, JPEG ou WebP — Máximo 10MB
                </p>
              </div>
            )}
          </label>
        </div>

        {file && (
          <>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
                className="mt-0.5"
              />
              <div>
                <Label htmlFor="consent" className="text-sm font-medium cursor-pointer">
                  Consentimento para processamento
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Seu documento será processado por IA para extrair dados de equity.
                  O arquivo será deletado após a extração.
                </p>
              </div>
            </div>

            {(uploading || extracting) && (
              <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {uploading ? "Fazendo upload..." : "Extraindo dados com IA..."}
                  </span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button
              onClick={handleUploadAndExtract}
              disabled={!consent || uploading || extracting}
              className="w-full h-11 gap-2"
            >
              {uploading || extracting ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Processando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                  Enviar e extrair dados
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
