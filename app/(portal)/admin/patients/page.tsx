import { AccountList } from "@/src/features/rehab/admin-views";

export default async function Page({ searchParams }: PageProps<"/admin/patients">) { return <AccountList role="PATIENT" query={await searchParams} />; }
