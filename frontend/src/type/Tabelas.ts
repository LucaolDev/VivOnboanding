export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role:  'Jovem_Aprendiz' | 'Estagio' | 'Assistente'| 'Analista_Junior' |'Analista_Pleno'|'Analista_Senior'|'Analista_Dados'|'DevOps'|'Scrum_Master'|'Desenvolvedor_Junior'|'Desenvolvedor_Pleno'|'Desenvolvedor_Senior'|'QA_Junior'|'QA_Pleno'|'QA_Senior'|'Especialista'|'Coordenador'|'Tech_Lead'|'Gerente'|'Gerente_Senior'|'Executivo'|'Diretor'|'Vice_Presidente' |'CEO';
  image?: string;
  createdAt: string;
  isNewUser?: boolean;
  isManager?: boolean;
  
  managerId?: string;
  departmentId?: string;
  teamId?: string;

  department?: Department;
  team?: Team;
  manager?: User;
  users?: User[]; 
  userOnTrail?: UserOnTrail[];
}

export interface Trail {
  id: string;
  title: string;
  description: string;
  duration: number;
  isActive: boolean;
  createdAt: string;
  assignedUsers: number;

  departmentId?: string;
  teamId?: string;

  department?: Department;
  team?: Team;
  step?: Step[];
  userOnTrail?: UserOnTrail[];
}

export interface Step {
  id: string;
  title: string;
  description?: string;
  duration: number;
  order: number;
  isRequired: boolean;
  type: 'video' | 'question' | 'book';

  trailId: string;
  trail?: Trail;
  content?: Content;
}

export interface Content {
  id: string;
  videoUrl?: string;
  description?: string;
  documentUrl?: string;

  stepId?: string;
  step?: Step;
  question: Question[];
}

export interface Question {
  id: string;
  questionTitle: string;
  type: 'multiple';
  options: string[];         
  correctAswer: number;      

  contentId: string;
  content?: Content;
}

export interface Department{
  id: string;
  name: string;
  color: string;
  userCount: number;

  managerId?: string;
  teams: Team[];
  users?: User[];
  trails?: Trail[];

}

export interface Team{
  id: string;
  name: string;
  departmentId: string;
  memberCount?: number;
  color: string;
  
  leaderId?: string;
  department?: Department;
  users?: User[];
  trails?: Trail[];
}

export interface UserOnTrail{
  id: string;
  userId: string;
  trailId: string;
  assignedAt: string;

  user?: User;
  trail?: Trail;
}

