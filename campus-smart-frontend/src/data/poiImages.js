// ============================================================================
// Imagens e descrições detalhadas dos POIs
// URLs hospedadas no Supabase Storage (bucket: poi-images)
// ============================================================================

export const POI_IMAGES = {
  'bloco-m': {
    imageUrl: 'https://fahtpzebuhvdnylgadyz.supabase.co/storage/v1/object/public/poi-images/bloco-m.jpeg',
    description: 'Clínica de Odontologia. Atende pacientes da comunidade e alunos da UNAERP, oferecendo tratamentos odontológicos completos.',
    extraInfo: 'Bloco M — Clínica de Odontologia',
  },

  // Adicionar outros POIs conforme as fotos chegarem:
  // 'bloco-a': { imageUrl: '...', description: '...', extraInfo: '...' },
  // 'bloco-e': { imageUrl: '...', description: '...', extraInfo: '...' },
  // 'cantina': { imageUrl: '...', description: '...', extraInfo: '...' },
};

// Imagem de fallback (usada quando não há foto do POI)
export const DEFAULT_POI_IMAGE = null;
