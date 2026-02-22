import { Injectable, signal, computed } from '@angular/core';

// --- Interfaces ---
export type FrictionStatus = 'pending' | 'answered' | 'ignored' | 'critical';

export interface FrictionPoint {
  id: string;
  type: 'missing-aria' | 'cryptic-id' | 'no-label' | 'ambiguous-button' | 'empty-alt';
  elementHtml: string;
  selector: string;
  intentQuestion: string;
  status: FrictionStatus;
  userResponse?: string;
}

// --- Servicio ---
@Injectable({ providedIn: 'root' })
export class ScannerService {
  // --- Signals de Estado ---
  isScanning = signal<boolean>(false);
  scanError = signal<string | null>(null);
  scannedUrl = signal<string | null>(null);
  frictionPoints = signal<FrictionPoint[]>([]);

  // --- Computed: Stats en tiempo real ---
  stats = computed(() => {
    const points = this.frictionPoints();
    return {
      total: points.length,
      pending: points.filter((p) => p.status === 'pending').length,
      answered: points.filter((p) => p.status === 'answered').length,
      critical: points.filter((p) => p.status === 'critical').length,
      ignored: points.filter((p) => p.status === 'ignored').length,
    };
  });

  // --- Método Principal de Escaneo ---
  async scanUrl(url: string): Promise<void> {
    this.isScanning.set(true);
    this.scanError.set(null);
    this.frictionPoints.set([]);
    this.scannedUrl.set(url);

    try {
      const html = await this.fetchViaProxy(url);
      const dom = this.parseHtml(html);
      const points = this.analyzeDom(dom);
      this.frictionPoints.set(points);

      if (points.length === 0) {
        const isSpa = this.detectIfSpa(html);

        if (isSpa) {
          this.scanError.set(
            `SPA Detectada: El DOM de esta aplicación se construye ` +
              `con JavaScript en el cliente. El análisis estático solo ` +
              `recibe el HTML inicial vacío y no puede inspeccionar ` +
              `los componentes renderizados. Prueba con un sitio de ` +
              `contenido estático para obtener resultados completos.`,
          );
        } else {
          this.scanError.set(
            `Sin fricción detectada: No se encontraron puntos de ` +
              `ambigüedad semántica. El sitio parece ser LLM-friendly.`,
          );
        }
      }
    } catch (error: any) {
      this.scanError.set(error.message || 'Error desconocido al intentar escanear la URL.');
    } finally {
      this.isScanning.set(false);
    }
  }

  private detectIfSpa(html: string): boolean {
    const spaSignals = [
      /<app-root/i, // Angular
      /<div id="root"/i, // React / Vue
      /<div id="app"/i, // Vue
      /ng-version=/i, // Angular attribute
      /data-reactroot/i, // React legacy
      /\/__nuxt__/i, // Nuxt.js
      /window\.__NEXT_DATA__/i, // Next.js
    ];
    return spaSignals.some((signal) => signal.test(html));
  }

  // --- Fetch a través de CORS Proxy ---
  private async fetchViaProxy(url: string): Promise<string> {
    // allorigins.win es un proxy CORS gratuito y open-source
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`El proxy no pudo acceder a la URL. Código: ${response.status}`);
    }

    const data = await response.json();

    if (!data.contents) {
      throw new Error(
        'El proxy devolvió una respuesta vacía. La URL puede estar bloqueando proxies.',
      );
    }

    return data.contents;
  }

  // --- Parsear HTML String a DOM ---
  private parseHtml(html: string): Document {
    // DOMParser es nativo del navegador, sin dependencias externas
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  // --- Motor de Análisis de Fricción Semántica ---
  private analyzeDom(dom: Document): FrictionPoint[] {
    const points: FrictionPoint[] = [];
    let idCounter = 0;

    const generateId = () => `fp-${Date.now()}-${idCounter++}`;

    // ── Regla 1: Botones sin aria-label ni texto visible ─────────────────
    dom.querySelectorAll('button, [role="button"]').forEach((el) => {
      const hasLabel = el.getAttribute('aria-label');
      const hasText = el.textContent?.trim();
      const hasTitle = el.getAttribute('title');

      if (!hasLabel && !hasText && !hasTitle) {
        points.push({
          id: generateId(),
          type: 'ambiguous-button',
          elementHtml: this.getCleanHtml(el),
          selector: this.buildSelector(el),
          intentQuestion:
            '¿Qué acción ejecuta este botón? ¿Cuál es su propósito funcional para el flujo del usuario?',
          status: 'pending',
        });
      }
    });

    // ── Regla 2: Inputs sin label asociado ───────────────────────────────
    dom.querySelectorAll('input, textarea, select').forEach((el) => {
      const id = el.getAttribute('id');
      const hasAriaLabel = el.getAttribute('aria-label');
      const hasAriaLabelledBy = el.getAttribute('aria-labelledby');
      const hasLinkedLabel = id ? dom.querySelector(`label[for="${id}"]`) : null;

      if (!hasAriaLabel && !hasAriaLabelledBy && !hasLinkedLabel) {
        points.push({
          id: generateId(),
          type: 'no-label',
          elementHtml: this.getCleanHtml(el),
          selector: this.buildSelector(el),
          intentQuestion: `¿Qué dato espera capturar este campo ${el.tagName.toLowerCase()}? ¿Cuál es su contexto de validación?`,
          status: 'pending',
        });
      }
    });

    // ── Regla 3: Imágenes sin alt o con alt vacío ────────────────────────
    dom.querySelectorAll('img').forEach((el) => {
      const alt = el.getAttribute('alt');
      if (alt === null || alt.trim() === '') {
        points.push({
          id: generateId(),
          type: 'empty-alt',
          elementHtml: this.getCleanHtml(el),
          selector: this.buildSelector(el),
          intentQuestion:
            '¿Qué información comunica esta imagen? ¿Es decorativa o contiene datos relevantes para el contexto?',
          status: 'pending',
        });
      }
    });

    // ── Regla 4: Elementos con IDs crípticos ─────────────────────────────
    const crypticIdRegex = /^[a-z0-9]{6,}$|^(comp|ng|_|el|div|cmp)\d+/i;
    dom.querySelectorAll('[id]').forEach((el) => {
      const id = el.getAttribute('id') || '';
      if (crypticIdRegex.test(id)) {
        points.push({
          id: generateId(),
          type: 'cryptic-id',
          elementHtml: this.getCleanHtml(el),
          selector: `#${id}`,
          intentQuestion: `El ID "#${id}" es semánticamente opaco. ¿Qué contenido o sección representa este contenedor en la lógica de la aplicación?`,
          status: 'pending',
        });
      }
    });

    // ── Regla 5: Elementos interactivos sin aria-label ───────────────────
    dom.querySelectorAll('a[href], [role="link"], [role="menuitem"]').forEach((el) => {
      const hasLabel = el.getAttribute('aria-label');
      const hasText = el.textContent?.trim();
      if (!hasLabel && !hasText) {
        points.push({
          id: generateId(),
          type: 'missing-aria',
          elementHtml: this.getCleanHtml(el),
          selector: this.buildSelector(el),
          intentQuestion:
            '¿A dónde navega o qué acción desencadena este enlace? No tiene texto ni etiqueta descriptiva.',
          status: 'pending',
        });
      }
    });

    return points;
  }

  // --- Helpers de DOM ----
  private getCleanHtml(el: Element): string {
    // Obtenemos solo el tag de apertura, sin el innerHTML (puede ser enorme)
    return el.outerHTML.split('>')[0] + '>';
  }

  private buildSelector(el: Element): string {
    if (el.id) return `#${el.id}`;
    const classes = Array.from(el.classList).slice(0, 2).join('.');
    return classes ? `${el.tagName.toLowerCase()}.${classes}` : el.tagName.toLowerCase();
  }

  // --- Mutadores de Estado para FrictionPoints ---
  updatePointStatus(id: string, status: FrictionStatus, response?: string): void {
    this.frictionPoints.update((points) =>
      points.map((p) =>
        p.id === id ? { ...p, status, userResponse: response ?? p.userResponse } : p,
      ),
    );
  }
}
