import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { renderExtratoHTML } from "@/lib/pdf/extrato-template";
import ExcelJS from "exceljs";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs"; // garante ambiente Node na Vercel

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

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "pdf").toLowerCase();
  const { filters, options } = await req.json();

  const leftImg = await fileToDataUri("/images/alma.png");
  const rightImg = await fileToDataUri("/images/med-pantanal.png");


  if (format === "xlsx") {
    // ======= Geração de Excel =======
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Extrato");

    ws.mergeCells("A1:D1");
    ws.getCell("A1").value = "INSTITUTO ALMA PANTANEIRA";
    ws.getCell("A1").font = { bold: true };

    ws.mergeCells("A2:D2");
    ws.getCell("A2").value = "EXPEDIÇÃO ALMA PANTANEIRA – MÉDICOS DO PANTANAL";

    ws.mergeCells("A3:D3");
    ws.getCell("A3").value = "CNPJ: 25.118.108/0001-04";

    ws.mergeCells("A4:D4");
    ws.getCell("A4").value =
      "Endereço: Rua Cuiabá – n° 1288 – Centro, Corumbá-MS. CEP – 79330-070";

    ws.mergeCells("A5:D5");
    ws.getCell("A5").value = "Documento médico";

    ws.addRow([]);
    ws.addRow(["Período", `${filters?.dataInicio || "—"} → ${filters?.dataFim || "—"}`]);
    ws.addRow(["Fazenda sede", filters?.fazendaSede || "Todas"]);
    ws.addRow(["Gênero", filters?.genero || "Todos"]);
    ws.addRow(["Tipo de atendimento", filters?.tipoAtendimento || "Todos"]);
    ws.addRow([]);
    ws.addRow([
      "Seções incluídas:",
      [
        options?.incluirDetalheProcedimentos && "Detalhe procedimentos",
        options?.incluirTotaisPorGenero && "Totais por gênero",
        options?.incluirTotaisPorTipoAtendimento && "Totais por tipo",
      ]
        .filter(Boolean)
        .join("; "),
    ]);

    const buffer = await wb.xlsx.writeBuffer();
    const fileName = `relatorio-extrato-${Date.now()}.xlsx`;
    return new NextResponse(buffer, {
      status: 200,
      headers: new Headers({
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          fileName
        )}`,
      }),
    });
  }

  // ======= Geração de PDF =======
  const html = renderExtratoHTML({
    leftImg,
    rightImg,
    titulo: "Extrato",
    filtros: filters,
    secoes: options,
  });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: { top: "15mm", right: "12mm", bottom: "15mm", left: "12mm" },
    printBackground: true,
  });

  await browser.close();

  const fileName = `relatorio-extrato-${Date.now()}.pdf`;
  // Convert Uint8Array to Buffer for NextResponse
  const pdfNodeBuffer = Buffer.from(pdfBuffer);
  return new NextResponse(pdfNodeBuffer, {
    status: 200,
    headers: new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
        fileName
      )}`,
    }),
  });
}
