export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export const privacySections: LegalSection[] = [
  {
    title: "1. Coleta de Dados",
    paragraphs: ["Coletamos os seguintes dados para operar o app com seguranca e personalizacao:"],
    bullets: [
      "Dados de cadastro: nome, e-mail e idade opcional.",
      "Dados de perfil: peso, altura e objetivos opcionais.",
      "Dados de localizacao: usados apenas para validar check-ins.",
      "Dados de uso: treinos, habitos e atividade na comunidade.",
    ],
  },
  {
    title: "2. Uso dos Dados",
    bullets: [
      "Fornecer e melhorar os servicos do WEMOVELT.",
      "Personalizar a experiencia de treino.",
      "Validar check-ins por geolocalizacao ou QR Code.",
      "Exibir historicos, metas e estatisticas.",
      "Enviar comunicacoes relacionadas ao servico.",
    ],
  },
  {
    title: "3. Localizacao",
    paragraphs: [
      "A localizacao e consultada apenas no momento do check-in para validar sua presenca. Nao fazemos rastreamento continuo.",
      "Se preferir, voce pode usar check-in por QR Code quando houver identificacao valida no equipamento.",
    ],
  },
  {
    title: "4. Compartilhamento",
    paragraphs: ["Nao vendemos dados pessoais. O compartilhamento acontece apenas quando necessario:"],
    bullets: [
      "Com sua autorizacao explicita.",
      "Para cumprimento de obrigacoes legais.",
      "Com provedores contratados sob clausulas de confidencialidade.",
    ],
  },
  {
    title: "5. Seguranca",
    paragraphs: [
      "Aplicamos controles de acesso, autenticacao e protecoes de infraestrutura para reduzir risco de exposicao indevida.",
      "Mesmo assim, nenhum sistema conectado e isento de falhas ou incidentes.",
    ],
  },
  {
    title: "6. Seus Direitos",
    bullets: [
      "Acessar seus dados pessoais.",
      "Corrigir dados desatualizados ou incompletos.",
      "Solicitar anonimização ou exclusao quando aplicavel.",
      "Revogar consentimentos fornecidos.",
      "Solicitar portabilidade conforme a LGPD.",
    ],
  },
  {
    title: "7. Retencao",
    paragraphs: [
      "Mantemos os dados enquanto a conta estiver ativa ou enquanto houver necessidade operacional e legal.",
      "Apos solicitacao de exclusao, os dados sao removidos de acordo com os prazos legais e tecnicos aplicaveis.",
    ],
  },
  {
    title: "8. Cookies e Sessao",
    paragraphs: [
      "Usamos cookies e mecanismos equivalentes para manter sua sessao autenticada e melhorar a experiencia no app e no PWA.",
    ],
  },
  {
    title: "9. Contato",
    paragraphs: [
      "Para exercer seus direitos ou tirar duvidas sobre privacidade, utilize os canais de suporte indicados no aplicativo.",
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    title: "1. Aceitacao",
    paragraphs: [
      "Ao usar o WEMOVELT, voce concorda com estes termos. Se nao concordar com as regras descritas aqui, nao utilize o aplicativo.",
    ],
  },
  {
    title: "2. O que o app entrega",
    paragraphs: [
      "O WEMOVELT organiza check-ins, treinos, habitos e interacao entre usuarios em academias e espacos de treino ao ar livre.",
    ],
  },
  {
    title: "3. Cadastro e conta",
    paragraphs: [
      "Voce deve manter seus dados corretos e proteger suas credenciais. O uso da conta e de sua responsabilidade.",
    ],
  },
  {
    title: "4. Uso adequado",
    bullets: [
      "Nao publicar conteudo ofensivo, ilegal ou fraudulento.",
      "Nao tentar acessar contas ou dados de terceiros.",
      "Nao usar o servico para manipular check-ins ou estatisticas.",
      "Respeitar a comunidade e as regras de convivencia.",
    ],
  },
  {
    title: "5. Conteudo publicado",
    paragraphs: [
      "O conteudo continua sendo seu, mas voce autoriza sua exibicao dentro da plataforma para funcionamento do feed e interacoes sociais.",
    ],
  },
  {
    title: "6. Saude e seguranca",
    paragraphs: [
      "O app nao substitui avaliacao medica nem acompanhamento profissional. Consulte um especialista antes de iniciar treinos intensos.",
    ],
  },
  {
    title: "7. Mudancas",
    paragraphs: [
      "Podemos atualizar o app, os fluxos e estes termos. Mudancas relevantes serao comunicadas pelos canais oficiais do produto.",
    ],
  },
  {
    title: "8. Contato",
    paragraphs: ["Duvidas sobre uso, suporte ou operacao podem ser enviadas pelos canais do aplicativo."],
  },
];

export const privacyLastUpdated = "14 de marco de 2026";
export const termsLastUpdated = "14 de marco de 2026";
