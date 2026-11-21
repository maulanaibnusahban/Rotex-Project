import { AccountList } from "@/src/features/rehab/admin-views";

export default async function Page({ searchParams }: PageProps<"/admin/doctors">) { return <AccountList role="DOCTOR" query={await searchParams} />; }
