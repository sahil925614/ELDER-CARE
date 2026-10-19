export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8">
      
      <p className="text-sm font-medium text-brand-700">Frontend foundation</p>
      <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
      <p className="mt-4 max-w-xl leading-7 text-slate-600">This route is ready. Page design, forms, and API integration will be implemented during feature development.</p>
    </section>
  )
}
