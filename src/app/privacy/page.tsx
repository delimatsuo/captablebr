export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl prose">
      <h1>Política de Privacidade</h1>
      <p className="text-muted-foreground">Última atualização: Março 2026</p>

      <h2>1. Dados Coletados</h2>
      <p>
        Coletamos dados de contexto da empresa (estágio, setor, modelo de negócio) e
        dados de compensação em equity (cargo, percentual, vesting). Nenhuma empresa
        ou executivo é identificado nos benchmarks.
      </p>

      <h2>2. Uso dos Dados</h2>
      <p>
        Os dados são utilizados exclusivamente para gerar benchmarks anonimizados e
        agregados. Nenhum dado individual é exposto — apenas médias e percentis de
        grupos com no mínimo 5 executivos.
      </p>

      <h2>3. Upload de Documentos</h2>
      <p>
        Documentos enviados são processados por IA (Google Vertex AI) para extração
        de dados de equity. Os arquivos são deletados automaticamente após a extração
        e confirmação pelo usuário, ou em no máximo 24 horas.
      </p>

      <h2>4. Compartilhamento</h2>
      <p>
        Não compartilhamos dados individuais com terceiros. Apenas dados agregados e
        anonimizados são exibidos na plataforma.
      </p>

      <h2>5. LGPD</h2>
      <p>
        Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você pode
        solicitar a exclusão completa dos seus dados a qualquer momento.
      </p>

      <h2>6. Contato</h2>
      <p>
        Para dúvidas sobre privacidade, entre em contato pelo email:
        privacidade@captablebr.com
      </p>
    </div>
  );
}
