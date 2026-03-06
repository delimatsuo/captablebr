export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl prose">
      <h1>Politica de Privacidade</h1>
      <p className="text-muted-foreground">Ultima atualizacao: Março 2026</p>

      <h2>1. Dados Coletados</h2>
      <p>
        Coletamos dados de perfil da empresa (estagio, setor, modelo de negocio) e
        dados de grants de equity (cargo, percentual, vesting). O nome da empresa e
        armazenado mas nunca exibido nos benchmarks.
      </p>

      <h2>2. Uso dos Dados</h2>
      <p>
        Os dados sao utilizados exclusivamente para gerar benchmarks anonimizados e
        agregados. Nenhum dado individual e exposto - apenas medias e percentis de
        grupos com no minimo 5 empresas.
      </p>

      <h2>3. Upload de Documentos</h2>
      <p>
        Documentos enviados sao processados por IA (Google Vertex AI) para extracao
        de dados de equity. Os arquivos sao deletados automaticamente apos a extracao
        e confirmacao pelo usuario, ou em no maximo 24 horas.
      </p>

      <h2>4. Compartilhamento</h2>
      <p>
        Nao compartilhamos dados individuais com terceiros. Apenas dados agregados e
        anonimizados sao exibidos na plataforma.
      </p>

      <h2>5. LGPD</h2>
      <p>
        Em conformidade com a Lei Geral de Protecao de Dados (LGPD), voce pode
        solicitar a exclusao completa dos seus dados a qualquer momento.
      </p>

      <h2>6. Contato</h2>
      <p>
        Para duvidas sobre privacidade, entre em contato pelo email:
        privacidade@captablebr.com
      </p>
    </div>
  );
}
