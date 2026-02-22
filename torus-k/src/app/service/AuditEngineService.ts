import { Injectable, signal } from '@angular/core';

export interface AuditPoint {
  id: string;
  element: string;
  context: string;
  aiQuestion: string;
  userResponse?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditEngineService {
  // Usamos Signals para reactividad moderna en Angular 18
  auditResults = signal<AuditPoint[]>([]);

  analyzeHtml(rawHtml: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    const points: AuditPoint[] = [];

    // 1. Buscar contenedores vacíos (Típico de Dash/React/Angular)
    const dashContainer = doc.querySelector('#react-entry-point, #dash-app-container');
    if (dashContainer) {
      points.push({
        id: 'spa-detect',
        element: 'div#react-entry-point',
        context: 'Contenedor dinámico detectado',
        aiQuestion: 'Esta web carga datos vía JS. ¿Qué indicadores se renderizan tras la carga inicial?'
      });
    }

    // 2. Buscar IDs técnicos sin etiquetas descriptivas (Puntos ciegos)
    const technicalDivs = doc.querySelectorAll('[id*="graph"], [id*="table"], [id*="kpi"]');
    technicalDivs.forEach(el => {
      if (!el.getAttribute('aria-label')) {
        points.push({
          id: el.id,
          element: el.tagName,
          context: `ID detectado: ${el.id}`,
          aiQuestion: `Encontré un contenedor de datos '${el.id}'. ¿Qué significado tiene este valor para un análisis ecológico?`
        });
      }
    });

    this.auditResults.set(points);
  }
}