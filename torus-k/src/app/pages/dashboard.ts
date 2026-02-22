import { Component } from '@angular/core';
import { AuditListComponent } from '../core/auditList/auditList';
import { ResponsePanelComponent } from '../core/panel/responsePanel';
import { UrlInputComponent } from '../core/urlInput/urlInput';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [UrlInputComponent, AuditListComponent, ResponsePanelComponent],
  styleUrls: ["./dashboard.css"],
  template: `
    <!-- Fondo atmosférico -->
    <!-- src/app/components/dashboard/dashboard.component.html -->
<div class="dashboard-bg min-h-screen relative overflow-hidden">
  <!-- Fondo celestial degradado -->
  <div class="celestial-gradient"></div>

  <!-- Capas de nubes animadas -->
  <div class="clouds-layer-1"></div>
  <div class="clouds-layer-2"></div>
  <div class="clouds-layer-3"></div>

  <!-- Efecto de luz solar -->
  <div class="sunlight-glow"></div>

  <!-- Orbe top-right (ahora con tonos celestiales) -->
  <div
    class="
      pointer-events-none fixed -top-32 -right-32
      size-[28rem] rounded-full
      bg-[radial-gradient(circle,rgba(129,199,132,0.12)_0%,transparent_70%)]
      z-[1]
    "
  ></div>

  <!-- Orbe bottom-left (tonos celestiales) -->
  <div
    class="
      pointer-events-none fixed -bottom-40 -left-40
      size-[32rem] rounded-full
      bg-[radial-gradient(circle,rgba(178,235,242,0.15)_0%,transparent_70%)]
      z-[1]
    "
  ></div>

  <!-- Capa de contenido sobre fondo y nubes -->
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- ── Header ── -->
    <header class="mb-10">
      <!-- Marca + badge de versión -->
      <div class="flex items-baseline gap-3 mb-3">
        <h1
          class="celestial-brand-gradient font-mono font-black tracking-tight
                    text-4xl sm:text-5xl drop-shadow-lg"
        >
          Torus K
        </h1>

        <span
          class="
            font-mono text-[0.65rem] tracking-widest
            px-2 py-0.5 rounded-full
            bg-gradient-to-br from-white/40 to-emerald-100/30
            backdrop-blur-sm
            border border-emerald-500/30
            text-emerald-800/80
            shadow-sm
          "
          >v1.0</span
        >
      </div>

      <!-- Tagline -->
      <p class="font-mono text-sm mb-4 flex items-center gap-1 flex-wrap">
        <span class="celestial-tagline-gradient">
          Traductor de Semántica para IA &nbsp;|&nbsp; Optimizador de
        </span>

        <code
          class="
            ml-1 px-2 py-0.5 rounded text-xs font-mono
            bg-gradient-to-br from-white/50 to-teal-50/40
            backdrop-blur-sm
            border border-teal-500/30
            text-teal-800
            shadow-sm
          "
          >llms.txt</code
        >
      </p>

      <!-- Línea decorativa -->
      <div class="celestial-header-line"></div>
    </header>

    <!-- ── Panel de Onboarding ── -->
    <div class="celestial-onboarding-panel">
      <h3 class="text-xl font-bold text-emerald-900">¿Qué es Torus K?</h3>
      <p class="text-slate-700">
        Torus K es una herramienta que transforma la manera en que los buscadores de IA
        interpretan tu sitio web. Detecta elementos confusos que las máquinas no comprenden y te
        permite definir su intención a través de un proceso interactivo de auditoría.
      </p>
      <h3 class="mt-4 text-xl font-bold text-emerald-900">Beneficios para tu Web y Negocio</h3>
      <p class="text-slate-700">Implementar Torus K ofrece las siguientes ventajas:</p>
      <ul class="text-slate-700">
        <li>
          <b class="text-teal-800">Mejora la visibilidad</b>: Asegura que los agentes de IA reconozcan y recomienden
          tu sitio.
        </li>
        <li>
          <b class="text-teal-800">Elimina alucinaciones</b>: Provee claridad sobre las intenciones de los elementos,
          evitando confusiones en las respuestas de la IA.
        </li>
        <li>
          <b class="text-teal-800">Optimización para el futuro</b>: Prepara tu web para la próxima generación de
          búsqueda y asistencia automatizada.
        </li>
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
        <div class="celestial-col-divider"></div>
        <div class="sticky top-6">
          <app-response-panel />
        </div>
      </div>
    </div>

    <!-- ── Footer ── -->
    <footer class="celestial-footer-line mt-16 pt-4 font-mono text-xs text-center">
      <a
        class="celestial-tagline-gradient hover:drop-shadow-md transition-all duration-300"
        href="https://github.com/fabocv/Torus-K"
        target="_blank"
        rel="noopener noreferrer"
      >
        Torus K &copy; {{ currentYear }} &mdash; AI-Native Semantic Layer |
      </a>
    </footer>
  </div>
</div>
  `,
})
export class DashboardComponent {
  currentYear = new Date().getFullYear();
}
