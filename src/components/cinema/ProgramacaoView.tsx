'use client';

import { useMemo, useState } from 'react';
import { ProgramacaoDateNav } from '@/components/cinema/ProgramacaoDateNav';
import { ProgramacaoPorFilme } from '@/components/cinema/ProgramacaoPorFilme';
import type { Filme, Sessao } from '@/lib/api/types';
import { agruparSessoesPorFilme } from '@/lib/utils/sessoes-group';
import { getProximosDiasProgramacao, hojeIsoLocal } from '@/lib/utils/programacao-datas';

type ProgramacaoViewProps = {
  filmes: Filme[];
  sessoes: Sessao[];
};

export function ProgramacaoView({ filmes, sessoes }: ProgramacaoViewProps) {
  const dias = useMemo(() => getProximosDiasProgramacao(7), []);
  const [dataSelecionada, setDataSelecionada] = useState(() => hojeIsoLocal());

  const sessoesDoDia = useMemo(
    () => sessoes.filter((s) => s.data === dataSelecionada),
    [sessoes, dataSelecionada],
  );

  const sessoesPorFilme = useMemo(() => agruparSessoesPorFilme(sessoesDoDia), [sessoesDoDia]);

  const filmesDoDia = useMemo(() => {
    const ids = new Set(sessoesDoDia.map((s) => s.filme.id));
    return filmes.filter((f) => ids.has(f.id));
  }, [filmes, sessoesDoDia]);

  const diaAtual = dias.find((d) => d.iso === dataSelecionada);

  return (
    <div className="mt-8">
      <ProgramacaoDateNav
        dias={dias}
        selecionado={dataSelecionada}
        onSelecionar={setDataSelecionada}
      />

      {diaAtual && (
        <p className="mt-4 text-body-sm text-on-surface-variant">
          Sessões de{' '}
          <span className="font-medium text-on-surface">
            {diaAtual.labelTopo === 'HOJE' || diaAtual.labelTopo === 'AMANHÃ'
              ? diaAtual.labelTopo.toLowerCase()
              : `${diaAtual.dia}/${dataSelecionada.slice(5, 7)}`}
          </span>
          {sessoesDoDia.length > 0 && (
            <>
              {' '}
              · {sessoesDoDia.length} {sessoesDoDia.length === 1 ? 'sessão' : 'sessões'}
            </>
          )}
        </p>
      )}

      {sessoesDoDia.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-outline-variant px-6 py-10 text-center text-body-md text-on-surface-variant">
          Nenhuma sessão programada para este dia. Escolha outra data acima.
        </p>
      ) : (
        <ProgramacaoPorFilme
          filmes={filmesDoDia}
          sessoesPorFilme={sessoesPorFilme}
          className="mt-6"
          compact
        />
      )}
    </div>
  );
}
