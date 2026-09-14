import { Button } from "@/components/ui/button";

export function DataTablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const first = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);
  const pages = Array.from(new Set([1, page - 1, page, page + 1, totalPages])).filter(
    (item) => item >= 1 && item <= totalPages,
  );

  return (
    <div className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--ui-text-secondary)]">
        Mostrando {first}–{last} de {totalItems.toLocaleString("es-MX")} resultados
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        {pages.map((item, index) => {
          const previous = pages[index - 1];
          return (
            <span key={item} className="contents">
              {previous && item - previous > 1 ? (
                <span className="px-1 text-sm text-slate-400">…</span>
              ) : null}
              <Button
                variant={item === page ? "primary" : "secondary"}
                size="sm"
                className="min-w-9 px-2"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </Button>
            </span>
          );
        })}
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
