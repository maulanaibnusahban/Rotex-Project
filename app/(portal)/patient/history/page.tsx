import { PatientHistory } from "@/src/features/rehab/progress-views";

export default async function Page({ searchParams }: PageProps<"/patient/history">) { return <PatientHistory query={await searchParams} />; }
