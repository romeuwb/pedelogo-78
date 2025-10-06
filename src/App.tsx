export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-6 border-b flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reiniciado com sucesso</h1>
        <span className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm">Padrão visual preservado</span>
      </header>

      <main className="p-6 space-y-6">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Cores ativas</h2>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground">primary</span>
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-accent text-accent-foreground">accent</span>
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground">secondary</span>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Fonte</h2>
          <p className="text-sm opacity-80">Usando a família definida no tema (Inter + fallbacks do sistema).</p>
          <p>
            Exemplo de texto com <strong>peso</strong>, <em>itálico</em> e cores: 
            <span className="ml-2 text-delivery-orange">laranja</span>, 
            <span className="ml-2 text-delivery-green">verde</span>.
          </p>
        </section>
      </main>
    </div>
  )
}
