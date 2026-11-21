import { AssignmentList } from "@/src/features/rehab/admin-views";

export default async function Page({ searchParams }: PageProps<"/admin/assignments">) { return <AssignmentList query={await searchParams} />; }
