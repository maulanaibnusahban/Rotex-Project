import PDFDocument from "pdfkit";
import { AppointmentStatus, JournalStatus } from "@prisma/client";
import { appointmentLabels, clinicalNotes, methodLabels, modeLabels, movementLabels, sideLabels } from "./clinical-labels";
import { formatDate, formatTime, longDate } from "./core";
import type { ReportData } from "./report-data";
import type { ReportPeriod, RomSeries } from "./progress-data";

const ink = "#152b30";
const muted = "#435760";
const green = "#176b50";
const blue = "#26759b";
const line = "#e3eae7";
const fill = "#edf4f0";
const number = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });
const stamp = (date: Date) => formatDate(date) + " · " + formatTime(date) + " WIB";

export async function createReportPdf(patientName: string, period: ReportPeriod, data: ReportData) {
  const doc = new PDFDocument({
    size: "A4", margin: 44, bufferPages: true,
    info: { Title: "Laporan Terapi ROTEX", Author: "ROTEX" },
  });
  const parts: Buffer[] = [];
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => parts.push(chunk));
    doc.once("end", () => resolve(Buffer.concat(parts)));
    doc.once("error", reject);
  });
  const left = 44;
  const width = doc.page.width - left * 2;
  const textBottom = () => doc.page.height - 52;

  function room(height: number) {
    if (doc.y + height > textBottom()) doc.addPage();
  }

  function section(label: string) {
    room(62);
    doc.moveDown(0.7);
    doc.font("Helvetica-Bold").fontSize(16).fillColor(ink).text(label, left, doc.y);
    doc.moveDown(0.55);
  }

  function paragraph(text: string) {
    doc.font("Helvetica").fontSize(10).fillColor(muted).text(text, left, doc.y, { width, lineGap: 3 });
  }

  function table(headers: string[], rows: string[][], proportions: number[]) {
    const widths = proportions.map(part => part * width);
    function display(values: string[], header: boolean) {
      doc.font(header ? "Helvetica-Bold" : "Helvetica").fontSize(9);
      const padding = 7;
      const height = Math.max(...values.map((value, i) => doc.heightOfString(value, { width: widths[i] - padding * 2 }))) + padding * 2;
      if (!header && doc.y + height > textBottom()) {
        doc.addPage();
        display(headers, true);
        doc.font("Helvetica").fontSize(9);
      }
      const top = doc.y;
      if (header) doc.rect(left, top, width, height).fill(fill);
      let x = left;
      values.forEach((value, i) => {
        doc.fillColor(header ? green : ink).text(value, x + padding, top + padding, { width: widths[i] - padding * 2 });
        x += widths[i];
      });
      doc.strokeColor(line).lineWidth(0.55).moveTo(left, top + height).lineTo(left + width, top + height).stroke();
      doc.x = left;
      doc.y = top + height;
    }
    room(62);
    display(headers, true);
    rows.forEach(row => display(row, false));
    doc.moveDown(0.5);
  }

  function drawSeries(series: RomSeries) {
    room(238);
    doc.font("Helvetica-Bold").fontSize(11).fillColor(ink).text(series.label, left, doc.y, { width });
    doc.moveDown(0.4);
    const top = doc.y + 13;
    const plotLeft = left + 42;
    const plotWidth = width - 60;
    const height = 115;
    const first = series.points[0];
    const last = series.points[series.points.length - 1];
    const min = series.points.reduce((n, point) => Math.min(n, point.degrees), first.degrees);
    const max = series.points.reduce((n, point) => Math.max(n, point.degrees), first.degrees);
    const lower = Math.floor(min / 5) * 5 - 5;
    const upper = Math.ceil(max / 5) * 5 + 5;
    const x = (value: number) => plotLeft + (last.timestamp === first.timestamp ? plotWidth / 2 : (value - first.timestamp) / (last.timestamp - first.timestamp) * plotWidth);
    const y = (value: number) => top + height - (value - lower) / (upper - lower) * height;
    doc.font("Helvetica").fontSize(8).fillColor(muted).text("ROM (°)", left, top - 12, { lineBreak: false });
    for (let i = 0; i <= 4; i++) {
      const value = lower + (upper - lower) * i / 4;
      const horizontal = y(value);
      doc.strokeColor(line).lineWidth(0.55).moveTo(plotLeft, horizontal).lineTo(plotLeft + plotWidth, horizontal).stroke();
      doc.fillColor(muted).text(number.format(value) + "°", left, horizontal - 4, { width: 35, align: "right", lineBreak: false });
    }
    if (series.points.length > 1) {
      doc.strokeColor(blue).lineWidth(1.8).moveTo(x(first.timestamp), y(first.degrees));
      series.points.slice(1).forEach(point => doc.lineTo(x(point.timestamp), y(point.degrees)));
      doc.stroke();
    }
    series.points.forEach(point => doc.circle(x(point.timestamp), y(point.degrees), 3.25).fill(blue));
    const dateFirst = formatDate(new Date(first.timestamp));
    const dateLast = formatDate(new Date(last.timestamp));
    doc.fillColor(muted).text(dateFirst, plotLeft, top + height + 8, { width: plotWidth, lineBreak: false, align: dateFirst === dateLast ? "center" : "left" });
    if (dateFirst !== dateLast) doc.text(dateLast, plotLeft, top + height + 8, { width: plotWidth, lineBreak: false, align: "right" });
    doc.x = left;
    doc.y = top + height + 28;
    if (series.points.length > 1) {
      const delta = last.degrees - first.degrees;
      paragraph("Selisih pengukuran awal dan terakhir " + (delta > 0 ? "+" : "") + number.format(delta) + "°.");
    }
    table(["Tanggal sesi (WIB)", "Nilai", "Dokter"], series.points.map(point => [
      stamp(new Date(point.timestamp)), number.format(point.degrees) + "°", point.doctor,
    ]), [0.42, 0.17, 0.41]);
  }

  doc.font("Helvetica-Bold").fontSize(12).fillColor(green).text("ROTEX", left);
  doc.moveDown(0.45);
  doc.fontSize(25).fillColor(ink).text("Laporan terapi pasien");
  doc.moveDown(0.35);
  paragraph("Pasien  " + patientName);
  paragraph("Periode  " + period.from + " sampai " + period.to + " (WIB)");
  paragraph("Dibuat  " + stamp(new Date()));

  section("Rekap jadwal terapi");
  if (!data.appointments.length) paragraph("Belum ada jadwal dalam periode ini.");
  else table(["Tanggal dan waktu (WIB)", "Dokter", "Status"], data.appointments.map(row => [
    stamp(row.startAt) + " – " + (formatDate(row.startAt) === formatDate(row.endAt) ? formatTime(row.endAt) : stamp(row.endAt)),
    row.doctor.user.name,
    row.status === AppointmentStatus.COMPLETED && row.journal?.status !== JournalStatus.FINALIZED
      ? "Selesai · Menunggu hasil" : appointmentLabels[row.status],
  ]), [0.44, 0.31, 0.25]);

  section("Rekap kontrol dan sesi final");
  if (!data.journals.length) paragraph("Belum ada jurnal final dalam periode ini.");
  for (const row of data.journals) {
    room(95);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(ink).text(longDate(row.therapyAt) + " · " + formatTime(row.therapyAt) + " WIB", left, doc.y);
    paragraph(row.doctor.user.name + " · Versi " + row.version + (row.appointmentId ? "" : " · Sesi tanpa jadwal"));
    const session = [
      row.shoulderSide && "Sisi " + sideLabels[row.shoulderSide],
      row.mode && "Mode " + modeLabels[row.mode],
      row.durationMinutes !== null && "Durasi " + row.durationMinutes + " menit",
      row.repetitions !== null && "Repetisi " + row.repetitions,
      row.painScore !== null && "Skor nyeri " + row.painScore + " dari " + row.painScaleMaximum,
    ].filter(Boolean);
    if (session.length) paragraph(session.join(" · "));
    for (const [key, label] of clinicalNotes) {
      const value = row[key];
      if (!value) continue;
      room(44);
      doc.moveDown(0.25);
      doc.font("Helvetica-Bold").fontSize(10).fillColor(ink).text(label, left);
      paragraph(value);
    }
    if (row.measurements.length) {
      doc.moveDown(0.5);
      table(["Gerakan / sisi", "Nilai", "Metode / mode"], row.measurements.map(measurement => [
        movementLabels[measurement.movement] + " · " + sideLabels[measurement.shoulderSide],
        number.format(Number(measurement.degrees)) + "°",
        [methodLabels[measurement.method], measurement.methodNotes, (measurement.mode ?? row.mode) && modeLabels[(measurement.mode ?? row.mode)!]].filter(Boolean).join(" · "),
      ]), [0.3, 0.15, 0.55]);
    }
    doc.moveDown(0.85);
  }

  section("Grafik perkembangan ROM");
  if (!data.series.length) paragraph("Belum ada pengukuran final yang sesuai dengan filter.");
  for (const series of data.series) drawSeries(series);

  const pages = doc.bufferedPageRange();
  for (let page = pages.start; page < pages.start + pages.count; page++) {
    doc.switchToPage(page);
    doc.font("Helvetica").fontSize(8).fillColor(muted);
    const label = String(page + 1) + " / " + pages.count;
    const footer = doc.page.height - 32;
    doc.text("ROTEX · Laporan terapi", left, footer, { lineBreak: false });
    doc.text(label, left + width - doc.widthOfString(label), footer, { lineBreak: false });
  }
  doc.end();
  return finished;
}
