import { Schedule } from "@/src/features/rehab/appointment-views";

export default async function Page({ searchParams }: PageProps<"/admin/appointments">) { return <Schedule audience="ADMIN" query={await searchParams} />; }
