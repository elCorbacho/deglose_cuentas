import { Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ExportButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export default function ExportButton({
  onClick,
  disabled = false,
  label = 'Exportar CSV',
}: ExportButtonProps) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      tabIndex={0}
      className="border-border bg-background hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <span className="inline-flex">{button}</span>
        </TooltipTrigger>
        <TooltipContent>No hay datos para exportar</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
