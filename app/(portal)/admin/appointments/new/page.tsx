import { NewAppointment } from "@/src/features/rehab/appointment-views";

export default async function Page({ searchParams }: PageProps<"/admin/appointments/new">) { return <NewAppointment audience="ADMIN" query={await searchParams} />; }
