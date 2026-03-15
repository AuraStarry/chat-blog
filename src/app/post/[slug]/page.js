import { redirect } from "next/navigation";

export default async function LegacyPostRedirect({ params }) {
  const { slug } = await params;
  redirect(`/page/${slug}`);
}
