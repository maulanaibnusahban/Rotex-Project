import { NewAppointment } from "@/src/features/rehab/appointment-views";

export default async function Page({ searchParams }: PageProps<"/doctor/appointments/new">) { return <NewAppointment audience="DOCTOR" query={await searchParams} />; }
