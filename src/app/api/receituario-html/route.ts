// src/app/api/receituario-html/route.ts
import { NextRequest } from "next/server";
import chromium from "@sparticuz/chromium"; // mesmo pacote do atestado
import fs from "node:fs/promises";
import path from "node:path";

import { renderReceituarioHTML } from "@/lib/pdf/receituario-template";
// Se seu render já está em outro caminho, ajuste o import acima.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- Tipos leves para robustez no parse ---
type ReceitaMedicamentoLike = {
  medicamento: { id?: number; nome?: string } | string;
  duracao?: string | number;
  unidade_medida?: string;
  frequencia?: string; // usamos como posologia livre
  observacao?: string;
};

// Lê arquivo em /public e retorna como data URI base64
async function fileToDataUri(relPath: string) {
  const abs = path.join(process.cwd(), "public", relPath.replace(/^\//, ""));
  const buf = await fs.readFile(abs);
  const b64 = buf.toString("base64");
  const ext = path.extname(abs).toLowerCase();
  const mime =
    ext === ".png" ? "image/png" :
    ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
    ext === ".svg" ? "image/svg+xml" :
    "application/octet-stream";
  return `data:${mime};base64,${b64}`;
}

// Decide qual puppeteer usar (igual ao atestado)
async function getBrowser() {
  const isProd = process.env.NODE_ENV === "production";
  const isVercel = !!process.env.VERCEL;

  if (isProd || isVercel) {
    const puppeteer = await import("puppeteer-core");
    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });
  }
  const puppeteer = await import("puppeteer");
  return puppeteer.launch({ headless: true });
}

// Converte objeto (formato antigo) para linha pronta
function composeLinhaReceita(it: ReceitaMedicamentoLike) {
  const nome =
    typeof it.medicamento === "string"
      ? it.medicamento
      : it.medicamento?.nome ?? String(it.medicamento);

  const posologiaLivre = String(it.frequencia ?? "").trim();
  const qtd = String(it.duracao ?? "").trim();
  const um = String(it.unidade_medida ?? "").trim();
  const obs = String(it.observacao ?? "").trim();

  const corpo =
    posologiaLivre || [qtd && `${qtd}`, um && `${um}`].filter(Boolean).join(" ");
  const obsFmt = obs ? ` — ${obs}` : "";

  return `${nome}${corpo ? ": " + corpo : ""}${obsFmt}`;
}

// Normaliza medicacoes para string[]
function normalizeMedicacoes(m: unknown): string[] {
  if (!m) return [];
  // já é string simples?
  if (typeof m === "string") return [m];
  // já é array de strings?
  if (Array.isArray(m) && m.every(x => typeof x === "string")) {
    return m as string[];
  }
  // é array de objetos (formato antigo)?
  if (Array.isArray(m)) {
    return (m as ReceitaMedicamentoLike[]).map(composeLinhaReceita).filter(Boolean);
  }
  // fallback
  return [String(m)];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Headers/imagens opcionais
    const headerLeftDataUri  = await fileToDataUri("/images/alma.png");
    const headerRightDataUri = await fileToDataUri("/images/med-pantanal.png");
    // Se tiver assinatura padrão:
    // const assinaturaDataUri = await fileToDataUri("/images/assinatura.png");

    // Normaliza as linhas de medicações (tanto faz string[] ou objetos)
    const linhas = normalizeMedicacoes(body.medicacoes);

    // Monta HTML (seu template já deve aceitar string[] em medicacoes)
    const html = renderReceituarioHTML({
      paciente_nome: body.paciente_nome ?? "Paciente",
      data_nascimento: body.data_nascimento ?? "",
      data_hora: body.data_hora ?? "",
      medico_nome: body.medico_nome ?? "",
      crm: body.crm ?? "",
      especialidade: body.especialidade ?? "",
      medicacoes: linhas, // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      headerLeftDataUri,
      headerRightDataUri,
      assinaturaDataUri: body.assinaturaDataUri, // se vier no body
    });

    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    });

    await browser.close();

    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receituario_${Date.now()}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e?.message ?? "Falha ao gerar PDF" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
