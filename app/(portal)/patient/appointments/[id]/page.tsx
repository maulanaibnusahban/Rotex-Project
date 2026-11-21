import { PatientAppointmentDetails } from "@/src/features/rehab/appointment-views";

export default async function Page({ params }: PageProps<"/patient/appointments/[id]">) {
  return <PatientAppointmentDetails id={(await params).id} />;
}
