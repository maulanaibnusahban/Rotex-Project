import { ReviewAssignmentEnd } from "@/src/features/rehab/admin-views";

export default async function Page({ params, searchParams }: PageProps<"/admin/assignments/[id]">) {
  return <ReviewAssignmentEnd id={(await params).id} query={await searchParams} />;
}
