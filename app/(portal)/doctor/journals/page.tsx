import { DoctorJournals } from "@/src/features/rehab/journal-views";

export default async function Page({ searchParams }: PageProps<"/doctor/journals">) { return <DoctorJournals query={await searchParams} />; }
