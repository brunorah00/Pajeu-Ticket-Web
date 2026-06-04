'use client';

import Image from 'next/image';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const ACCEPT_ATTR = ACCEPTED_TYPES.join(',');
const MAX_SIZE_MB = 5;
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;

export type PosterUploadProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string | null;
  onValidationError?: (message: string | null) => void;
  titulo?: string;
  dica?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
    return 'Use JPEG, PNG ou WEBP.';
  }
  if (file.size > MAX_BYTES) {
    return `A imagem deve ter no máximo ${MAX_SIZE_MB} MB.`;
  }
  return null;
}

export function PosterUpload({
  value,
  onChange,
  disabled = false,
  error: externalError,
  onValidationError,
  titulo = 'Poster do filme',
  dica = 'Proporção ideal 2:3 (pôster de cinema). Formatos JPEG, PNG ou WEBP.',
}: PosterUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = externalError ?? localError;

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const applyFile = useCallback(
    (file: File | null) => {
      if (!file) {
        setLocalError(null);
        onValidationError?.(null);
        onChange(null);
        return;
      }
      const validation = validateFile(file);
      if (validation) {
        setLocalError(validation);
        onValidationError?.(validation);
        onChange(null);
        return;
      }
      setLocalError(null);
      onValidationError?.(null);
      onChange(file);
    },
    [onChange, onValidationError],
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    applyFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0] ?? null;
    applyFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function openPicker() {
    if (!disabled) inputRef.current?.click();
  }

  function handleRemove() {
    applyFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-label-sm font-label-sm text-on-surface-variant">
          Poster do filme
        </label>
        <span className="text-label-sm text-on-surface-variant/80">Opcional · até {MAX_SIZE_MB} MB</span>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        disabled={disabled}
        onChange={handleInputChange}
        aria-describedby={displayError ? `${inputId}-error` : `${inputId}-hint`}
      />

      {value && previewUrl ? (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
          <div className="relative aspect-[2/3] w-full max-w-[280px] bg-surface-container-high">
            <Image
              src={previewUrl}
              alt="Pré-visualização do poster"
              fill
              className="object-cover"
              sizes="280px"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="truncate text-label-sm font-label-sm text-white">{value.name}</p>
              <p className="text-label-sm text-white/70">{formatFileSize(value.size)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-outline-variant p-3">
            <button
              type="button"
              disabled={disabled}
              onClick={openPicker}
              className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-label-sm font-label-sm text-on-surface transition hover:border-primary hover:text-primary disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">swap_horiz</span>
              Trocar imagem
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={handleRemove}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-label-sm font-label-sm text-on-surface-variant transition hover:bg-error-container/20 hover:text-error disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              Remover
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
          onClick={openPicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          aria-label="Enviar poster do filme. Arraste uma imagem ou clique para escolher."
          className={[
            'group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition',
            disabled ? 'cursor-not-allowed opacity-50' : '',
            dragOver
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-outline-variant bg-surface-container hover:border-primary/60 hover:bg-surface-container-high',
            displayError ? 'border-error/60' : '',
          ].join(' ')}
        >
          <div
            className={[
              'mb-4 flex size-16 items-center justify-center rounded-full transition',
              dragOver ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-primary group-hover:bg-primary/20',
            ].join(' ')}
          >
            <span className="material-symbols-outlined text-4xl">
              {dragOver ? 'download' : 'image'}
            </span>
          </div>

          <p className="font-title-md text-title-md text-on-surface">
            {dragOver ? 'Solte a imagem aqui' : 'Arraste o poster ou clique para escolher'}
          </p>
          <p id={`${inputId}-hint`} className="mt-2 max-w-xs text-body-sm text-on-surface-variant">
            {dica}
          </p>

          <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-container px-5 py-2.5 text-label-lg font-label-lg text-white shadow-sm transition group-hover:opacity-90">
            <span className="material-symbols-outlined text-xl">upload</span>
            Selecionar arquivo
          </span>
        </div>
      )}

      {displayError && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-body-sm text-error"
        >
          <span className="material-symbols-outlined shrink-0 text-lg">error</span>
          {displayError}
        </p>
      )}
    </div>
  );
}
