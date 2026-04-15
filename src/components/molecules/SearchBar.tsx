import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Buscar por comercio, descripción o monto…',
}: SearchBarProps) {
  const [term, setTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTerm(value);
    onSearch(value);
  };

  const handleClear = () => {
    setTerm('');
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
        value={term}
        onChange={handleChange}
        aria-label="Buscar transacciones por comercio, descripción o monto"
        placeholder={placeholder}
        className="border-border bg-background focus:border-ring focus:ring-ring/30 w-full rounded-md border py-1.5 pl-8 pr-8 text-sm outline-none transition-colors focus:ring-2"
      />
      {term.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="hover:bg-muted absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full transition-colors"
        >
          <X className="h-3 w-3" style={{ color: 'var(--text-soft)' }} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
