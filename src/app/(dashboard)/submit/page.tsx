"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmissionForm } from "@/components/forms/submission-form";
import { DocumentUpload } from "@/components/forms/document-upload";
import type { SubmissionFormData, GrantFormData } from "@/lib/validations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SubmissionApiData = Record<string, any>;

/** Convert null values to undefined (Prisma returns null, Zod .optional() expects undefined) */
function stripNulls<T>(obj: T): T {
  if (obj === null) return undefined as T;
  if (Array.isArray(obj)) return obj.map(stripNulls) as T;
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, v === null ? undefined : v])
    ) as T;
  }
  return obj;
}

function normalizeApiData(data: SubmissionApiData) {
  const { grants: apiGrants, instrumentType, equityPercentage, vestingTotalMonths, cliffMonths,
    vestingSchedule, grantType, isFirstInRole, inputMode, numberOfShares, totalSharesOutstanding,
    strikePrice, currentSharePrice, lastValuation, grantDate, grantLabel, vestingStartDate,
    ...submissionFields } = data;

  // If API returns grants array, use it directly
  if (apiGrants && Array.isArray(apiGrants) && apiGrants.length > 0) {
    return { ...stripNulls(submissionFields), grants: apiGrants.map(stripNulls) as Partial<GrantFormData>[] };
  }

  // Legacy: build grant from flat fields
  const legacyGrant: Partial<GrantFormData> = {
    instrumentType,
    equityPercentage,
    vestingTotalMonths,
    cliffMonths,
    vestingSchedule,
    grantType,
    isFirstInRole: isFirstInRole ?? false,
    inputMode: inputMode || "percentage",
    numberOfShares,
    totalSharesOutstanding,
    strikePrice,
    currentSharePrice,
    lastValuation,
    grantDate: grantDate ? new Date(grantDate) : undefined,
    grantLabel,
    vestingStartDate: vestingStartDate ? new Date(vestingStartDate) : undefined,
  };

  return { ...stripNulls(submissionFields), grants: [stripNulls(legacyGrant)] };
}

export default function SubmitPage() {
  return (
    <Suspense>
      <SubmitPageContent />
    </Suspense>
  );
}

function SubmitPageContent() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const initialStep = stepParam ? Number(stepParam) : undefined;

  const [extractedData, setExtractedData] = useState<Partial<SubmissionFormData> | null>(null);
  const [sourceDocumentUrl, setSourceDocumentUrl] = useState<string | undefined>();
  const [existingData, setExistingData] = useState<ReturnType<typeof normalizeApiData> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/submission")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setExistingData(normalizeApiData(data));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  function handleExtracted(data: Partial<SubmissionFormData>, objectName: string) {
    setExtractedData(data);
    setSourceDocumentUrl(objectName);
  }

  if (!loaded) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-10 w-48 bg-muted rounded animate-pulse mb-8" />
        <div className="h-96 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          {existingData ? "Editar compensação" : "Minha compensação"}
        </h1>
        <p className="text-muted-foreground text-[15px] mt-1">
          {existingData
            ? "Atualize seus dados de compensação."
            : "Compartilhe seus dados para acessar benchmarks do mercado."}
        </p>
      </div>

      <Tabs defaultValue={extractedData || initialStep ? "manual" : "upload"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-11">
          <TabsTrigger value="upload" className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            Upload de contrato
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            Preenchimento manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <DocumentUpload onExtracted={handleExtracted} />
          {extractedData && (
            <SubmissionForm
              initialData={existingData ? { ...existingData, ...normalizeApiData(extractedData as SubmissionApiData) } : normalizeApiData(extractedData as SubmissionApiData)}
              sourceDocumentUrl={sourceDocumentUrl}
              isAiExtracted
            />
          )}
        </TabsContent>

        <TabsContent value="manual">
          <SubmissionForm initialData={existingData} initialStep={initialStep} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
