import { getCompany } from "@/lib/actions";
import { CompanyProfileForm } from "@/components/forms/company-profile-form";
import type { CompanyFormData } from "@/lib/validations";

export default async function OnboardingPage() {
  const company = await getCompany();

  const initialData: CompanyFormData | null = company
    ? {
        stage: company.stage as CompanyFormData["stage"],
        businessModel: company.businessModel as CompanyFormData["businessModel"],
        sector: company.sector as CompanyFormData["sector"],
        subSector: company.subSector || undefined,
        headcountRange: company.headcountRange as CompanyFormData["headcountRange"],
        lastValuationRange: company.lastValuationRange as CompanyFormData["lastValuationRange"] | undefined,
        totalFundingRange: company.totalFundingRange as CompanyFormData["totalFundingRange"] | undefined,
        totalSharesOutstanding: company.totalSharesOutstanding || undefined,
        city: company.city || undefined,
        yearFounded: company.yearFounded || undefined,
      }
    : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {company ? "Perfil da empresa" : "Configure sua empresa"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {company
                ? "Atualize os dados da sua empresa. Nenhuma informacao identifica sua empresa nos benchmarks."
                : "Preencha os dados para comecar a usar os benchmarks. Sua empresa nunca sera identificada."}
            </p>
          </div>
        </div>
      </div>
      <CompanyProfileForm initialData={initialData} />
    </div>
  );
}
