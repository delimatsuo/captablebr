"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GrantForm } from "@/components/forms/grant-form";
import { DocumentUpload } from "@/components/forms/document-upload";
import type { GrantFormData } from "@/lib/validations";

export default function NewGrantPage() {
  const [extractedData, setExtractedData] = useState<Partial<GrantFormData> | null>(null);
  const [sourceDocumentUrl, setSourceDocumentUrl] = useState<string | undefined>();
  const [hasTotalShares, setHasTotalShares] = useState(false);

  useEffect(() => {
    fetch("/api/company-info")
      .then((r) => r.json())
      .then((data) => setHasTotalShares(!!data.totalSharesOutstanding))
      .catch(() => {});
  }, []);

  function handleExtracted(data: Partial<GrantFormData>, objectName: string) {
    setExtractedData(data);
    setSourceDocumentUrl(objectName);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Adicionar Executivo</h1>
          <p className="text-muted-foreground text-sm">
            Informe o equity total deste executivo (soma de todos os grants)
          </p>
        </div>
      </div>

      <Tabs defaultValue={extractedData ? "manual" : "upload"} className="space-y-6">
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
            <GrantForm
              initialData={extractedData}
              sourceDocumentUrl={sourceDocumentUrl}
              isAiExtracted
              hasTotalShares={hasTotalShares}
            />
          )}
        </TabsContent>

        <TabsContent value="manual">
          <GrantForm hasTotalShares={hasTotalShares} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
