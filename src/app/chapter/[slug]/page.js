export default async function ChapterPage({ params }) {
  const { slug } = await params;
  return (
    <div className="p-20 text-center">
      <h1 className="text-2xl font-bold">Debug Page - No Imports</h1>
      <p className="mt-4 text-slate-500">Slug: {slug}</p>
    </div>
  );
}
