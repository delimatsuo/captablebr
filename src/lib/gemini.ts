import { VertexAI } from "@google-cloud/vertexai";

const PROJECT_ID = process.env.GCP_PROJECT_ID || "paynequity";
const LOCATION = process.env.GCP_LOCATION || "us-central1";

const EXTRACTION_PROMPT = `Voce e um especialista em contratos de equity de startups brasileiras.

Extraia os seguintes campos deste documento:
- Cargo/titulo do beneficiario
- Tipo de instrumento de equity (Stock Options, Phantom Stock, RSU, Partnership Quotas (Cotas), SAR, Vesting Shares, Other)
- Percentual de equity (% do cap table fully diluted)
- Periodo total de vesting (em meses)
- Periodo de cliff (em meses)
- Cronograma de vesting (Monthly after cliff, Quarterly after cliff, Annual, Cliff only (all at once), Other)
- Tipo de grant (New-hire, Ongoing/Refresh, Promotion)

IMPORTANTE: NAO inclua nomes de pessoas, CPFs, enderecos ou qualquer dado pessoal na resposta.

Retorne APENAS o JSON abaixo, sem markdown ou texto adicional:
{
  "role": "...",
  "instrument_type": "...",
  "equity_percentage": 0.0,
  "vesting_total_months": 0,
  "cliff_months": 0,
  "vesting_schedule": "...",
  "grant_type": "...",
  "confidence": 0.0
}

Se um campo nao puder ser determinado, defina como null.
Inclua um score de confianca (0-1) para a extracao geral.`;

export interface ExtractionResult {
  role: string | null;
  instrument_type: string | null;
  equity_percentage: number | null;
  vesting_total_months: number | null;
  cliff_months: number | null;
  vesting_schedule: string | null;
  grant_type: string | null;
  confidence: number;
}

export async function extractFromDocument(
  fileContent: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
  const model = vertexAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

  const base64Content = fileContent.toString("base64");

  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64Content } },
          { text: EXTRACTION_PROMPT },
        ],
      },
    ],
  });

  const text =
    response.response?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response from Gemini");
  }

  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as ExtractionResult;
}
