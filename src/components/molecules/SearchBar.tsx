import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onSearch: (term: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onSearch,
  placeholder = 'Buscar por comercio, descripción o monto…',
}: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleClear = () => {
    onSearch('');
  };

  return (
    <div className="relative flex items-center">
      <Search
        className="pointer-events-none absolute left-2.5 h-4 w-4 shrink-0"
        style={{ color: 'var(--text-soft)' }}
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        aria-label="Buscar transacciones por comercio, descripción o monto"
        placeholder={placeholder}
        className="border-border bg-background focus:border-ring focus:ring-ring/30 w-full rounded-md border py-1.5 pl-8 pr-8 text-sm outline-none transition-colors focus:ring-2"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar texto"
          className="hover:bg-muted absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full transition-colors"
        >
          <X className="h-3 w-3" style={{ color: 'var(--text-soft)' }} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
