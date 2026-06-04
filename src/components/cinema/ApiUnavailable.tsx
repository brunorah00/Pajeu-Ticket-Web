type ApiUnavailableProps = {
  message?: string;
};

export function ApiUnavailable({
  message = 'Não foi possível conectar à API.',
}: ApiUnavailableProps) {
  return (
    <div className="mx-4 my-8 rounded-xl border border-outline-variant bg-surface-container p-6 text-center">
      <span className="material-symbols-outlined mb-2 text-4xl text-primary">cloud_off</span>
      <p className="font-title-md text-title-md text-on-surface">{message}</p>
      <ul className="mx-auto mt-4 max-w-md list-inside list-disc text-left text-body-sm text-on-surface-variant">
        <li>
          Suba a API:{' '}
          <code className="text-on-surface">cd Pajeu-Ticket-API && ./mvnw spring-boot:run</code>
        </li>
        <li>
          Confira o PostgreSQL (banco <code className="text-on-surface">cinepajeu</code>) e a senha em{' '}
          <code className="text-on-surface">.env</code> (veja <code className="text-on-surface">.env.example</code>)
        </li>
        <li>
          Teste:{' '}
          <a href="http://localhost:8080/swagger-ui.html" className="text-primary underline" target="_blank" rel="noreferrer">
            http://localhost:8080/swagger-ui.html
          </a>
        </li>
      </ul>
    </div>
  );
}
