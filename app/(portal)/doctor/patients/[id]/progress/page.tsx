import { ProgressPage } from "@/src/features/rehab/progress-views";

export default async function Page({ params, searchParams }: PageProps<"/doctor/patients/[id]/progress">) { return <ProgressPage audience="DOCTOR" id={(await params).id} query={await searchParams} />; }
