import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <article className="prose prose-neutral max-w-none">
        <h1>Política de Privacidade</h1>
        <p className="text-muted-foreground">Última atualização: Março 2026</p>

        <p>
          A presente Política de Privacidade descreve como a{" "}
          <strong>Ella Executive Search</strong> (&quot;Ella&quot;, &quot;nós&quot; ou
          &quot;nosso&quot;), operadora da plataforma <strong>CaptableBR</strong>{" "}
          (&quot;Plataforma&quot;), coleta, utiliza, armazena e protege os dados pessoais dos
          usuários (&quot;Usuário&quot; ou &quot;você&quot;), em conformidade com a Lei Geral
          de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).
        </p>

        <h2>1. Controlador dos dados</h2>
        <p>
          O controlador dos dados pessoais tratados nesta Plataforma é a{" "}
          <strong>Ella Executive Search</strong>, empresa de recrutamento executivo
          com sede em São Paulo, Brasil.
        </p>
        <p>
          Contato do Encarregado de Proteção de Dados (DPO):{" "}
          <a href="mailto:contact@ellaexecutivesearch.com">contact@ellaexecutivesearch.com</a>
        </p>

        <h2>2. Dados coletados</h2>
        <p>Coletamos as seguintes categorias de dados:</p>
        <h3>2.1 Dados de cadastro</h3>
        <ul>
          <li>Nome completo</li>
          <li>Endereço de email</li>
          <li>URL do perfil do LinkedIn</li>
          <li>Cargo executivo (C-level ou VP)</li>
        </ul>
        <h3>2.2 Dados de contexto da empresa</h3>
        <ul>
          <li>Estágio da startup (Seed, Series A, B, C+)</li>
          <li>Setor de atuação</li>
          <li>País e moeda</li>
        </ul>
        <h3>2.3 Dados de compensação</h3>
        <ul>
          <li>Salário anual</li>
          <li>Percentual de equity, tipo de instrumento (Stock Options, Phantom Shares, RSU, Cotas)</li>
          <li>Cronograma de vesting e cliff</li>
        </ul>
        <h3>2.4 Documentos (opcional)</h3>
        <p>
          Caso o Usuário opte pelo upload de documentos para extração automática via IA, os
          arquivos são processados e <strong>deletados imediatamente</strong> após a extração
          e confirmação dos dados, ou em no máximo 24 horas.
        </p>
        <h3>2.5 Dados de navegação</h3>
        <p>
          Cookies essenciais de sessão (autenticação) são utilizados. Não utilizamos cookies de
          rastreamento ou publicidade.
        </p>

        <h2>3. Finalidade do tratamento</h2>
        <p>Os dados pessoais são tratados para as seguintes finalidades:</p>
        <ul>
          <li>Verificação de identidade e cargo via perfil do LinkedIn</li>
          <li>Geração de benchmarks anonimizados e agregados de compensação executiva</li>
          <li>Manutenção da qualidade e integridade dos dados da Plataforma</li>
          <li>Comunicação com o Usuário sobre sua conta</li>
        </ul>

        <h2>4. Base legal</h2>
        <p>
          O tratamento dos dados pessoais é realizado com base no{" "}
          <strong>consentimento do Usuário</strong> (Art. 7º, I da LGPD), manifestado no
          momento do cadastro e da submissão dos dados de compensação.
        </p>

        <h2>5. Anonimização e agregação</h2>
        <p>
          Todos os benchmarks exibidos na Plataforma são <strong>anonimizados e agregados</strong>.
          Nenhum dado individual é exposto. Os benchmarks são calculados apenas quando há um
          mínimo de 10 executivos por segmento (cargo + estágio), garantindo que nenhum Usuário
          possa ser identificado.
        </p>

        <h2>6. Compartilhamento de dados</h2>
        <p>
          <strong>Não compartilhamos dados individuais com terceiros.</strong> Os dados são
          processados pelos seguintes serviços de infraestrutura:
        </p>
        <ul>
          <li>
            <strong>Google Cloud Platform (GCP)</strong> — hospedagem, banco de dados e
            processamento de IA (Vertex AI para extração de documentos)
          </li>
          <li>
            <strong>Firebase (Google)</strong> — autenticação de usuários
          </li>
        </ul>
        <p>
          Esses provedores atuam como operadores de dados e estão sujeitos a seus próprios
          termos de privacidade e proteção de dados.
        </p>

        <h2>7. Armazenamento e segurança</h2>
        <p>
          Os dados são armazenados em servidores da Google Cloud Platform localizados nos
          Estados Unidos, com criptografia em trânsito (TLS) e em repouso. Adotamos medidas
          técnicas e organizacionais adequadas para proteger os dados contra acesso não
          autorizado, perda ou destruição.
        </p>

        <h2>8. Direitos do Usuário (LGPD)</h2>
        <p>
          Nos termos da LGPD, você tem direito a:
        </p>
        <ul>
          <li>Confirmar a existência de tratamento dos seus dados</li>
          <li>Acessar seus dados pessoais</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
          <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
          <li>Solicitar a portabilidade dos dados</li>
          <li>
            <strong>Solicitar a exclusão completa dos seus dados</strong> a qualquer momento
          </li>
          <li>Revogar o consentimento</li>
        </ul>
        <p>
          Para exercer qualquer desses direitos, entre em contato pelo email{" "}
          <a href="mailto:contact@ellaexecutivesearch.com">contact@ellaexecutivesearch.com</a>.
          Responderemos em até 15 dias úteis.
        </p>

        <h2>9. Retenção de dados</h2>
        <p>
          Os dados pessoais são mantidos enquanto o Usuário possuir conta ativa na Plataforma.
          Após a exclusão da conta, os dados são removidos em até 30 dias, exceto dados já
          anonimizados e incorporados aos benchmarks agregados, que não são identificáveis.
        </p>

        <h2>10. Alterações nesta política</h2>
        <p>
          Reservamo-nos o direito de alterar esta política a qualquer momento. Alterações
          significativas serão comunicadas por email ou notificação na Plataforma.
        </p>

        <h2>11. Contato</h2>
        <p>
          Para dúvidas, reclamações ou solicitações relacionadas a esta Política de Privacidade:
        </p>
        <p>
          <strong>Ella Executive Search</strong><br />
          Email: <a href="mailto:contact@ellaexecutivesearch.com">contact@ellaexecutivesearch.com</a><br />
          São Paulo, Brasil
        </p>
        <p>
          Você também pode registrar reclamação junto à Autoridade Nacional de Proteção de
          Dados (ANPD) — <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">www.gov.br/anpd</a>.
        </p>

        <hr />
        <p className="text-sm text-muted-foreground">
          CaptableBR é um produto da{" "}
          <a
            href="https://ellaexecutivesearch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Ella Executive Search
          </a>
          , empresa de recrutamento executivo para startups com sede em São Paulo.
        </p>

        <p className="text-sm text-muted-foreground mt-4">
          <Link href="/" className="text-primary underline">← Voltar ao início</Link>
        </p>
      </article>
    </div>
  );
}
