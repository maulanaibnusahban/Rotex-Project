import { AppointmentDetails } from "@/src/features/rehab/appointment-views";

export default async function Page({ params }: PageProps<"/admin/appointments/[id]">) { return <AppointmentDetails audience="ADMIN" id={(await params).id} />; }
