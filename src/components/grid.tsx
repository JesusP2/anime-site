export function Grid<T extends { mal_id: number; }>({ data, Card }: { data: T[]; Card: React.FC<{ data: T }> }) {
  return (
    <div className="grid auto-fill-grid gap-6 px-10 w-full mx-auto">
      {data.map((item) => <Card key={item.mal_id} data={item} />)}
    </div>
  )
}
