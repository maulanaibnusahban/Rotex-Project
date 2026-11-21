import { ProgressPage } from "@/src/features/rehab/progress-views";

export default async function Page({ searchParams }: PageProps<"/patient/progress">) { return <ProgressPage audience="PATIENT" query={await searchParams} />; }
