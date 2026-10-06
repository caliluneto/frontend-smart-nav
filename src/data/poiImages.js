// ============================================================================
// Imagens e descrições detalhadas dos POIs
// URLs hospedadas no Supabase Storage (bucket: poi-images)
// ============================================================================

const SUPABASE_STORAGE_URL =
  'https://fahtpzebuhvdnylgadyz.supabase.co/storage/v1/object/public/poi-images';

export const POI_IMAGES = {
  'academia-geraldo-barreto': {
    imageUrl: `${SUPABASE_STORAGE_URL}/academia.jpeg`,
    description:
      'Academia de ginástica e musculação da UNAERP. Equipamentos modernos e acompanhamento profissional para alunos e colaboradores.',
    extraInfo: 'Academia Geraldo Barreto',
  },
  'bloco-e': {
    imageUrl: `${SUPABASE_STORAGE_URL}/bloco-e.jpeg`,
    description:
      'Bloco E — abriga a Biblioteca Central da UNAERP. Acervo completo, salas de estudo individuais e coletivas, e acesso a bases de dados científicas.',
    extraInfo: 'Bloco E — Biblioteca Central',
  },
  'bloco-i': {
    imageUrl: `${SUPABASE_STORAGE_URL}/bloco-i.jpeg`,
    description:
      'Bloco I — Arquitetura e Urbanismo. Salas de aula, ateliês de projeto e laboratórios específicos do curso.',
    extraInfo: 'Bloco I — Arquitetura e Urbanismo',
  },
  'bloco-j': {
    imageUrl: `${SUPABASE_STORAGE_URL}/bloco-j.jpeg`,
    description:
      'Bloco J — Farmácia. Abriga o curso de Farmácia, laboratórios de análises clínicas e farmacotécnica.',
    extraInfo: 'Bloco J — Farmácia',
  },
  'bloco-m': {
    imageUrl: `${SUPABASE_STORAGE_URL}/bloco-m.jpeg`,
    description:
      'Clínica de Odontologia da UNAERP. Atende pacientes da comunidade e alunos, oferecendo tratamentos odontológicos completos.',
    extraInfo: 'Bloco M — Clínica de Odontologia',
  },
  'bloco-n': {
    imageUrl: `${SUPABASE_STORAGE_URL}/bloco-n.jpeg`,
    description:
      'Bloco N — Biotecnologia. Laboratórios de pesquisa e salas de aula dos cursos de Biotecnologia e áreas afins.',
    extraInfo: 'Bloco N — Biotecnologia',
  },
  'bloco-r': {
    imageUrl: `${SUPABASE_STORAGE_URL}/bloco-r.jpeg`,
    description:
      'Bloco R — Secretaria da Medicina. Administração acadêmica do curso de Medicina da UNAERP.',
    extraInfo: 'Bloco R — Secretaria da Medicina',
  },
  'bloco-s': {
    imageUrl: `${SUPABASE_STORAGE_URL}/bloco-s.jpeg`,
    description:
      'Bloco S — salas de aula dos cursos da área da saúde e laboratórios multidisciplinares.',
    extraInfo: 'Bloco S',
  },
  'cantina-bloco-i': {
    imageUrl: `${SUPABASE_STORAGE_URL}/cantina-bloco-i.jpeg`,
    description:
      'Cantina do Bloco I. Ponto de alimentação e convivência para alunos e funcionários.',
    extraInfo: 'Cantina do Bloco I',
  },
  cantina: {
    imageUrl: `${SUPABASE_STORAGE_URL}/cantinas.jpeg`,
    description:
      'Cantinas e praça de alimentação da UNAERP. Diversas opções de refeições, lanches e bebidas.',
    extraInfo: 'Cantinas',
  },
  'estacionamento-costabile': {
    imageUrl: `${SUPABASE_STORAGE_URL}/estacionamento-costabile.jpeg`,
    description:
      'Estacionamento de alunos e visitantes, com acesso pela Av. Costábile Romano.',
    extraInfo: 'Estacionamento Av. Costábile Romano',
  },
  plug: {
    imageUrl: `${SUPABASE_STORAGE_URL}/plug.jpeg`,
    description:
      'Centro de Convivência / Plug. Espaço para eventos, descanso e integração entre alunos.',
    extraInfo: 'Plug — Centro de Convivência',
  },
};

// Imagem de fallback (usada quando não há foto do POI)
export const DEFAULT_POI_IMAGE = null;
