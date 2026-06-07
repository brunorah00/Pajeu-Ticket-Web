type PedidosBuscaInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function PedidosBuscaInput({ value, onChange, placeholder }: PedidosBuscaInputProps) {
  return (
    <div className="relative mt-4">
      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">
        search
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-outline-variant bg-surface-elevated py-2.5 pl-10 pr-10 text-body-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/70 focus:border-primary/50"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      )}
    </div>
  );
}
