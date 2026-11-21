import { AppointmentDetails } from "@/src/features/rehab/appointment-views";

export default async function Page({ params }: PageProps<"/doctor/appointments/[id]">) { return <AppointmentDetails audience="DOCTOR" id={(await params).id} />; }
