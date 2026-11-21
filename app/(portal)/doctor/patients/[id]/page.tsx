import { DoctorPatientDetails } from "@/src/features/rehab/journal-views";

export default async function Page({ params, searchParams }: PageProps<"/doctor/patients/[id]">) { return <DoctorPatientDetails id={(await params).id} query={await searchParams} />; }
