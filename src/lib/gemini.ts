import { VertexAI } from "@google-cloud/vertexai";
import { z } from "zod";
import { ROLES, INSTRUMENT_TYPES, VESTING_SCHEDULES, GRANT_TYPES, STAGES, SECTORS } from "./types";

const PROJECT_ID = process.env.GCP_PROJECT_ID || "paynequity";
const LOCATION = process.env.GCP_LOCATION || "us-central1";

const EXTRACTION_PROMPT = `Você é um especialista em contratos de equity de startups brasileiras.

Extraia os seguintes campos deste documento:
- Cargo/título do beneficiário (${ROLES.join(", ")})
- Tipo de instrumento de equity (${INSTRUMENT_TYPES.join(", ")})
- Percentual de equity (% do cap table fully diluted) — OBRIGATÓRIO, deve ser um número > 0
- Número de ações/cotas recebidas (se mencionado)
- Total de ações/cotas outstanding (fully diluted, se mencionado)
- Preço de exercício / strike price (se mencionado, para opções)
- Data do grant (se mencionada)
- Período total de vesting (em meses)
- Período de cliff (em meses)
- Cronograma de vesting (${VESTING_SCHEDULES.join(", ")})
- Tipo de grant (${GRANT_TYPES.join(", ")})
- Estágio da empresa se mencionado (${STAGES.join(", ")})
- Setor da empresa se mencionado (${SECTORS.join(", ")})

IMPORTANTE: NÃO inclua nomes de pessoas, CPFs, endereços ou qualquer dado pessoal na resposta.

Retorne APENAS o JSON abaixo, sem markdown ou texto adicional:
{
  "role": "...",
  "instrument_type": "...",
  "equity_percentage": 0.0,
  "number_of_shares": null,
  "total_shares_outstanding": null,
  "strike_price": null,
  "grant_date": null,
  "vesting_total_months": 0,
  "cliff_months": 0,
  "vesting_schedule": "...",
  "grant_type": "...",
  "stage": "...",
  "sector": "...",
  "confidence": 0.0
}

Se um campo não puder ser determinado, defina como null.
O campo equity_percentage DEVE ser um número positivo se encontrado no documento.
Para grant_date, use formato ISO (YYYY-MM-DD).
Inclua um score de confiança (0-1) para a extração geral.`;

const extractionResultSchema = z.object({
  role: z.string().nullable(),
  instrument_type: z.string().nullable(),
  equity_percentage: z.number().positive().nullable(),
  number_of_shares: z.number().int().positive().nullable().optional(),
  total_shares_outstanding: z.number().int().positive().nullable().optional(),
  strike_price: z.number().positive().nullable().optional(),
  grant_date: z.string().nullable().optional(),
  vesting_total_months: z.number().int().positive().nullable(),
  cliff_months: z.number().int().min(0).nullable(),
  vesting_schedule: z.string().nullable(),
  grant_type: z.string().nullable(),
  stage: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1),
});

export type ExtractionResult = z.infer<typeof extractionResultSchema>;

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
  const parsed = JSON.parse(cleaned);
  return extractionResultSchema.parse(parsed);
}
