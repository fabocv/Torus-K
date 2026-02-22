export type ActionType = 'pending' | 'answered' | 'ignored' | 'critical';

export interface FrictionPoint {
  id: string;
  elementHtml: string; // Ej: <button class="btn">...</button>
  intentQuestion: string; // La pregunta semántica para IA
  status: ActionType;
  userResponse?: string;
  severity: 'low' | 'medium' | 'high';
}
