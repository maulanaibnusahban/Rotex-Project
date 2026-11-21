import { JournalDetails } from "@/src/features/rehab/journal-views";

export default async function Page({ params }: PageProps<"/doctor/journals/[id]">) { return <JournalDetails audience="DOCTOR" id={(await params).id} />; }
