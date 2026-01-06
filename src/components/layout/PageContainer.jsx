export default function PageContainer({ title, children }) {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <div className="mx-auto px-4 py-10 max-w-5xl">
        <h1 className="mb-8 font-bold text-3xl tracking-tight">
          {title}
        </h1>
        {children}
      </div>
    </div>
  )
}
