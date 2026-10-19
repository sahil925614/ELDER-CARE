export function PageIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Elder Care</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">{description}</p>
    </div>
  )
}
