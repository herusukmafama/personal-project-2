type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="max-w-3xl">
      <p className="text-sm font-semibold tracking-[-0.01em] text-brand-600">{eyebrow}</p>
      <h1 className="apple-heading mt-2 text-4xl leading-[1.08] text-slate-950 dark:text-white sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-[1.5] tracking-[-0.012em] text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </header>
  )
}
