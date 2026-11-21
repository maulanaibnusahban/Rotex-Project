import { AuditAction, AuditScope } from "@prisma/client";
import { getSession } from "@/src/features/auth/session";
import { database } from "@/src/lib/db";
import { logAction } from "@/src/features/rehab/core";
import { getFilters, getPeriod, reportSubject } from "@/src/features/rehab/progress-data";
import { readReport } from "@/src/features/rehab/report-data";
import { createReportPdf } from "@/src/features/rehab/report-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const privateHeaders = { "Cache-Control": "private, no-store" };

export async function GET(request: Request, context: RouteContext<"/reports/[id]">) {
  const actor = await getSession();
  if (!actor) return new Response("Silakan masuk untuk membuka laporan.", { status: 401, headers: privateHeaders });
  const { id } = await context.params;
  try {
    const subject = await reportSubject(actor, id);
    if (!subject) return new Response("Laporan tidak ditemukan.", { status: 404, headers: privateHeaders });
    const query = Object.fromEntries(new URL(request.url).searchParams);
    const period = getPeriod(query);
    if (!period) return new Response("Rentang tanggal tidak valid.", { status: 400, headers: privateHeaders });
    const data = await readReport(actor, id, period, getFilters(query));
    const pdf = await createReportPdf(subject.user.name, period, data);
    await logAction(database(), actor.id, AuditAction.REPORT_EXPORTED, id, AuditScope.CLINICAL);
    return new Response(new Uint8Array(pdf), { headers: {
      ...privateHeaders, "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="rotex-laporan-' + period.from + '-' + period.to + '.pdf"',
    } });
  } catch {
    return new Response("Laporan belum dapat dibuat. Silakan coba lagi.", { status: 503, headers: privateHeaders });
  }
}
