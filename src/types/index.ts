export interface Igreja {
  id: string;
  nome: string;
  endereco: string;
  congregacoes: Congregacao[];
}

export interface Congregacao {
  id: string;
  nome: string;
  endereco: string;
  tipo: 'sede' | 'filial';
  lider_id: string;
  telefone: string;
  created_at: string;
  membros: Membro[];
}

export interface Membro {
  id: string;
  matricula: string;
  nome_completo: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  cpf: string;
  sexo: 'Masculino' | 'Feminino';
  estado_civil: 'Solteiro(a)' | 'Casado(a)' | 'Viúvo(a)' | 'União Estável';
  batizado: boolean;
  cargo_eclesiastico: 'Nenhum' | 'Auxiliar de Diácono(isa)' | 'Presbítero(a)' | 'Evangelista' | 'Pastor(a)' | 'Bispo(a)' | 'Apóstolo(a)';
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
    cep: string;
  };
  congregacao_id: string;
  created_at: string;
}

export interface Solicitacao {
  id: string;
  membro_id: string;
  tipo: 'carteirinha' | 'agendamento' | 'batismo' | 'transferencia' | 'alteracao_dados' | 'ministerio' | 'rede';
  status: 'pendente' | 'aprovada' | 'rejeitada';
  detalhes: string;
  created_at: string;
}

export interface MovimentacaoFinanceira {
  id: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  valor: number;
  descricao: string;
  data: string;
  congregacao_id: string;
}

export type MinisterioCategoria = 'Louvor' | 'Ensino' | 'Evangelismo' | 'Jovens' | 'Crianças' | 'Ação Social' | 'Mídia' | 'Recepção' | 'Infraestrutura' | 'Outro';

export interface Ministerio {
  id: string;
  nome: string;
  descricao: string;
  lider_id: string;
  categoria: MinisterioCategoria;
  membros_ids: string[];
}

export interface Notificacao {
  id: string;
  user_id: string;
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
  titulo: string;
  mensagem: string;
  created_at: string;
  lida: boolean;
}

export type RedeTipo = 'Célula' | 'Grupo de Estudo' | 'Ponto de Pregação';

export interface Rede {
  id: string;
  nome: string;
  tipo: RedeTipo;
  lider_id: string;
  endereco: string;
  dia_semana: string;
  horario: string;
  membros_ids: string[];
}
