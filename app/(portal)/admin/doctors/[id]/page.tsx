import { DoctorEditor } from "@/src/features/rehab/admin-views";

export default async function Page({ params }: PageProps<"/admin/doctors/[id]">) { return <DoctorEditor id={(await params).id} />; }
