import { JournalDetails } from "@/src/features/rehab/journal-views";

export default async function Page({ params }: PageProps<"/patient/journals/[id]">) { return <JournalDetails audience="PATIENT" id={(await params).id} />; }
