import { Schedule } from "@/src/features/rehab/appointment-views";

export default async function Page({ searchParams }: PageProps<"/doctor/appointments">) { return <Schedule audience="DOCTOR" query={await searchParams} />; }
