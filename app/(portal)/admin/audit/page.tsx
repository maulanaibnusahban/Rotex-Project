import { AuditList } from "@/src/features/rehab/admin-views";

export default async function Page({ searchParams }: PageProps<"/admin/audit">) { return <AuditList query={await searchParams} />; }
