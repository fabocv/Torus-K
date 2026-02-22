import { Component } from '@angular/core';
import { AuditListComponent } from '../core/auditList';
import { ResponsePanelComponent } from '../core/responsePanel';
import { UrlInputComponent } from '../core/urlInput';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [UrlInputComponent, AuditListComponent, ResponsePanelComponent],
  styles: [`

    /* ── Fondo con gradientes radiales atmosféricos ── */
    .dashboard-bg {
      background:
        radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, #00ff88 8%, transparent) 0%, transparent 70%),
        radial-gradient(ellipse 60% 40% at 90% 110%, color-mix(in srgb, #00e5ff 5%, transparent) 0%, transparent 60%),
        var(--color-torus-bg);
    }

    /* ── Texto con gradiente (no hay utility nativa para esto en TW4) ── */
    .brand-gradient {
      background: linear-gradient(135deg, #00ff88 0%, #00e5ff 55%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .tagline-gradient {
      background: linear-gradient(90deg, #4b5563, #9ca3af, #4b5563);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ── Línea gradiente horizontal ── */
    .header-line {
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        #00ff8855 25%,
        #00e5ff33 65%,
        transparent 100%
      );
    }

    /* ── Separador vertical entre columnas ── */
    .col-divider {
      display: none;
    }

    @media (min-width: 1024px) {
      .col-divider {
        display: block;
        position: absolute;
        left: -1rem;
        top: 0;
        bottom: 0;
        width: 1px;
        background: linear-gradient(
          180deg,
          transparent    0%,
          #00ff8830     20%,
          #00e5ff20     80%,
          transparent  100%
        );
      }
    }

    /* ── Footer border gradiente ── */
    .footer-line {
      border-top: 1px solid transparent;
      border-image: linear-gradient(90deg, transparent, #00ff8833, transparent) 1;
    }

    /* ── Estilo para el panel de onboarding ── */
    .onboarding-panel {
      background-color: rgba(13, 31, 43, 0.8); /* Fondo oscuro semitransparente */
      padding: 2rem;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
      border: 1px solid rgba(0, 255, 136, 0.5);
    }

    .onboarding-panel h3 {
      color: #00ff88; /* Color neón para el título */
    }

    .onboarding-panel p {
      color: #e0e0e0; /* Color de texto suave */
    }

    .onboarding-panel ul {
      list-style: disc;
      padding-left: 1.5rem;
      color: #e0e0e0; /* Color de texto para lista */
    }
  `],
  template: `

    <!-- Fondo atmosférico -->
    <div class="dashboard-bg min-h-screen">

      <!-- Orbe top-right -->
      <div class="
        pointer-events-none fixed -top-32 -right-32
        size-[28rem] rounded-full
        bg-[radial-gradient(circle,#00ff8809_0%,transparent_70%)]
        z-0
      "></div>

      <!-- Orbe bottom-left -->
      <div class="
        pointer-events-none fixed -bottom-40 -left-40
        size-[32rem] rounded-full
        bg-[radial-gradient(circle,#a78bfa07_0%,transparent_70%)]
        z-0
      "></div>

      <!-- Capa de contenido sobre orbes -->
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <!-- ── Header ── -->
        <header class="mb-10">

          <!-- Marca + badge de versión -->
          <div class="flex items-baseline gap-3 mb-3">
            <h1 class="brand-gradient font-mono font-black tracking-tight
                        text-4xl sm:text-5xl">
              Torus K
            </h1>

            <span class="
              font-mono text-[0.65rem] tracking-widest
              px-2 py-0.5 rounded-full
              bg-linear-to-br from-torus-panel to-[#16213e]
              border border-torus-accent/20
              text-torus-accent/60
            ">v1.0</span>
          </div>

          <!-- Tagline -->
          <p class="font-mono text-sm mb-4 flex items-center gap-1 flex-wrap">
            <span class="tagline-gradient">
              Traductor de Semántica para IA &nbsp;|&nbsp; Optimizador de
            </span>

            <code class="
              ml-1 px-2 py-0.5 rounded text-xs font-mono
              bg-linear-to-br from-[#0d2b1a] to-[#0d1f2b]
              border border-torus-accent/20
              text-torus-accent/80
            ">llms.txt</code>
          </p>

          <!-- Línea decorativa -->
          <div class="header-line"></div>
        </header>

        <!-- ── Panel de Onboarding ── -->
        <div class="onboarding-panel">
          <h3 class="text-xl font-bold">¿Qué es Torus K?</h3>
          <p>
            Torus K es una herramienta que transforma la manera en que los buscadores de IA interpretan tu sitio web. Detecta elementos confusos que las máquinas no comprenden y te permite definir su intención a través de un proceso interactivo de auditoría.
          </p>
          <h3 class="mt-4 text-xl font-bold">Beneficios para tu Web y Negocio</h3>
          <p>
            Implementar Torus K ofrece las siguientes ventajas:
          </p>
          <ul>
            <li> <b>Mejora la visibilidad</b>: Asegura que los agentes de IA reconozcan y recomienden tu sitio.</li>
            <li> <b>Elimina alucinaciones</b>: Provee claridad sobre las intenciones de los elementos, evitando confusiones en las respuestas de la IA.</li>
            <li> <b>Optimización para el futuro</b>: Prepara tu web para la próxima generación de búsqueda y asistencia automatizada.</li>
          </ul>
        </div>

        <!-- ── Grid principal ── -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <!-- Columna izquierda: 7/12 -->
          <div class="lg:col-span-7 flex flex-col gap-6">
            <app-url-input />
            <app-audit-list />
          </div>

          <!-- Columna derecha: 5/12 con sticky -->
          <div class="lg:col-span-5 relative">
            <div class="col-divider"></div>
            <div class="sticky top-6">
              <app-response-panel />
            </div>
          </div>

        </div>

        <!-- ── Footer ── -->
        <footer class="footer-line mt-16 pt-4 font-mono text-xs text-center">
          <span class="tagline-gradient">
            Torus K &copy; {{ currentYear }} &mdash; AI-Native Semantic Layer
          </span>
        </footer>

      </div>
    </div>
  `,
})
export class DashboardComponent {
  currentYear = new Date().getFullYear();
}
