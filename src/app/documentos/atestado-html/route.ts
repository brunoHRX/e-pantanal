// src/app/api/atestado-html/route.ts
import { NextRequest } from "next/server";
import chromium from "@sparticuz/chromium";
import fs from "node:fs/promises";
import path from "node:path";

import { renderAtestadoHTML, type AtestadoPayload } from "@/lib/pdf/atestado-template";

export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

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

// Decide qual puppeteer usar
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AtestadoPayload>;

    // Logos do cabeçalho (ajuste os caminhos conforme seus arquivos)
    const headerLeftDataUri  = await fileToDataUri("/images/alma.png");          // esquerda
    const headerRightDataUri = await fileToDataUri("/images/med-pantanal.png");  // direita (se existir)

    // Monte o HTML com dados vindos do body (com defaults)
    const html = renderAtestadoHTML({
      paciente_nome: body.paciente_nome ?? "Maria Souza",
      data_atendimento: body.data_atendimento ?? "05/10/2025",
      // dias_afastamento: body.dias_afastamento ?? "3",
      inicio_afastamento: body.inicio_afastamento ?? "06/10/2025",
      // diagnostico: body.diagnostico ?? "Gripe viral",
      // cid: body.cid ?? "J11",
      medico_nome: body.medico_nome ?? "Dr. João Pedro",
      crm: body.crm ?? "CRM-MS 98765",
      assinaturaDataUri: body.assinaturaDataUri, // opcional: passe no body se quiser
      headerLeftDataUri,
      headerRightDataUri,
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
        "Content-Disposition": `attachment; filename="atestado_${Date.now()}.pdf"`,
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
