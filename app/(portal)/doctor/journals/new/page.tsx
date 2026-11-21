import { NewJournal } from "@/src/features/rehab/journal-views";

export default async function Page({ searchParams }: PageProps<"/doctor/journals/new">) { return <NewJournal query={await searchParams} />; }
