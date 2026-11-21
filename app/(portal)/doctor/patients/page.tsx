import { DoctorPatients } from "@/src/features/rehab/journal-views";

export default async function Page({ searchParams }: PageProps<"/doctor/patients">) { return <DoctorPatients query={await searchParams} />; }
