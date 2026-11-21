import { Schedule } from "@/src/features/rehab/appointment-views";

export default async function Page({ searchParams }: PageProps<"/patient/appointments">) { return <Schedule audience="PATIENT" query={await searchParams} />; }
