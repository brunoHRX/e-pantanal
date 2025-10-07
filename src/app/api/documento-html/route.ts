// src/app/api/documento-html/route.ts
import { NextRequest } from "next/server";
import chromium from "@sparticuz/chromium";
import fs from "node:fs/promises";
import path from "node:path";

import { renderDocumentoHTML, type ReceitaPayload } from "@/lib/pdf/documento-generico-template";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const body = (await req.json()) as Partial<ReceitaPayload>;

    // Logos do cabeçalho
    const headerLeftDataUri  = await fileToDataUri("/images/alma.png");          // esquerda
    const headerRightDataUri = await fileToDataUri("/images/med-pantanal.png");  // direita (se existir)

    // Monta HTML a partir do payload
    const html = renderDocumentoHTML({
      paciente_nome: body.paciente_nome ?? "",
      data_nascimento: body.data_nascimento ?? "",
      data_hora: body.data_hora ?? "",
      medico_nome: body.medico_nome ?? "",
      crm: body.crm ?? "",
      especialidade: body.especialidade ?? "",
      headerLeftDataUri,
      headerRightDataUri,
      // assinaturaDataUri: await fileToDataUri("/images/assinatura.png"), // opcional
    });

    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfUint8Array = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    });

    await browser.close();

    // Convert Uint8Array to Buffer for Response compatibility
    const pdfBuffer = Buffer.from(pdfUint8Array);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="documento_${Date.now()}.pdf"`,
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
