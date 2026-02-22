import { Component, inject, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScannerService } from '../service/scanner';

// Fases que rotan visualmente mientras se escanea
const SCAN_PHASES = [
  'Conectando al proxy CORS...',
  'Descargando HTML estático...',
  'Inicializando DOMParser...',
  'Ejecutando reglas semánticas...',
  'Analizando atributos ARIA...',
  'Detectando IDs crípticos...',
  'Evaluando elementos interactivos...',
  'Consolidando puntos de fricción...',
];

@Component({
  selector: 'app-url-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      /* ── Barra de progreso infinita ─────────────────────────── */
      .scan-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        width: 100%;
        background: transparent;
        overflow: hidden;
        border-radius: 0 0 0.5rem 0.5rem;
      }

      .scan-bar::after {
        content: '';
        position: absolute;
        height: 100%;
        width: 40%;
        background: linear-gradient(90deg, transparent, #00ff88, #00ffcc, transparent);
        animation: scan-sweep 1.4s ease-in-out infinite;
      }

      @keyframes scan-sweep {
        0% {
          left: -40%;
        }
        100% {
          left: 140%;
        }
      }

      /* ── Botón gradiente animado ─────────────────────────────── */
      .btn-scanning {
        background-size: 200% 200%;
        background-image: linear-gradient(270deg, #00ff88, #00e5ff, #00ff88, #00e5ff);
        animation: gradient-shift 2s ease infinite;
        color: #0a0a0f;
      }

      @keyframes gradient-shift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }

      /* ── Input glow mientras escanea ────────────────────────── */
      .input-scanning {
        border-color: #00ff88 !important;
        box-shadow:
          0 0 0 1px #00ff8844,
          0 0 12px #00ff8822;
        animation: glow-pulse 2s ease-in-out infinite;
      }

      @keyframes glow-pulse {
        0%,
        100% {
          box-shadow:
            0 0 0 1px #00ff8844,
            0 0 12px #00ff8822;
        }
        50% {
          box-shadow:
            0 0 0 1px #00ff8888,
            0 0 20px #00ff8844;
        }
      }

      /* ── Dots de estado ──────────────────────────────────────── */
      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        display: inline-block;
      }

      .dot-idle {
        background: #4b5563;
      }
      .dot-scanning {
        background: #00ff88;
        animation: dot-blink 1s step-start infinite;
      }
      .dot-done {
        background: #00ff88;
      }
      .dot-error {
        background: #ff4444;
      }

      @keyframes dot-blink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.1;
        }
      }

      /* ── Fase de texto ───────────────────────────────────────── */
      .phase-text {
        animation: phase-fade 0.5s ease-in-out;
      }

      @keyframes phase-fade {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
  template: `
    <!-- Panel principal: posición relativa para la barra absoluta -->
    <div
      class="relative bg-torus-panel p-6 rounded-lg border shadow-xl transition-all duration-500"
      [class.border-gray-800]="!scanner.isScanning()"
      [class.border-green-800]="scanner.isScanning()"
    >
      <!-- ── Header con dots de estado ── -->
      <h2 class="text-torus-accent text-xl mb-4 flex items-center gap-3 font-bold">
        <span
          class="status-dot"
          [class.dot-idle]="!scanner.isScanning() && !scanner.scanError()"
          [class.dot-scanning]="scanner.isScanning()"
          [class.dot-done]="!scanner.isScanning() && errorType === 'clean'"
          [class.dot-error]="
            !scanner.isScanning() && (errorType === 'error' || errorType === 'spa')
          "
        ></span>
        <span class="animate-pulse">></span>
        Inicializar Escaneo Semántico
      </h2>

      <!-- ── Input + Botón ── -->
      <div class="flex flex-col sm:flex-row gap-4">
        <input
          type="url"
          [(ngModel)]="url"
          placeholder="https://ejemplo.com/app"
          class="flex-1 bg-torus-bg border border-gray-700 p-3 rounded text-white focus:outline-none transition-all duration-300 font-mono"
          [class.input-scanning]="scanner.isScanning()"
          (keyup.enter)="startScan()"
          [disabled]="scanner.isScanning()"
        />

        <button
          (click)="startScan()"
          [disabled]="scanner.isScanning() || !url"
          class="relative px-6 py-3 rounded font-bold transition-all duration-300 whitespace-nowrap overflow-hidden disabled:cursor-not-allowed"
          [class.btn-scanning]="scanner.isScanning()"
          [class.bg-torus-accent]="!scanner.isScanning()"
          [class.text-torus-bg]="!scanner.isScanning()"
          [class.hover:bg-green-400]="!scanner.isScanning()"
          [class.opacity-90]="scanner.isScanning()"
          [class.text-black]="scanner.isScanning()"
        >
          <!-- Ícono + texto del botón -->
          <span class="flex items-center gap-2">
            @if (scanner.isScanning()) {
              <!-- Spinner SVG minimalista -->
              <svg
                class="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Analizando...
            } @else {
              Ejecutar Escáner
            }
          </span>
        </button>
      </div>

      <!-- ── Fase de escaneo rotativa ── -->
      @if (scanner.isScanning()) {
        <div class="mt-4 flex items-center gap-2 font-mono text-xs text-gray-400">
          <span class="text-torus-accent">[sys]</span>
          @if (phaseVisible()) {
            <span class="phase-text"> {{ currentPhase() }} </span>
          }
        </div>
      }

      <!-- ── Feedback de resultado ── -->
      @if (!scanner.isScanning() && scanner.scanError()) {
        <div
          class="mt-4 p-3 rounded border font-mono text-sm transition-all duration-300"
          [class.bg-yellow-900]="errorType === 'spa'"
          [class.border-yellow-600]="errorType === 'spa'"
          [class.text-yellow-400]="errorType === 'spa'"
          [class.bg-opacity-20]="true"
          [class.bg-green-900]="errorType === 'clean'"
          [class.border-green-700]="errorType === 'clean'"
          [class.text-green-400]="errorType === 'clean'"
          [class.bg-red-900]="errorType === 'error'"
          [class.border-red-700]="errorType === 'error'"
          [class.text-red-400]="errorType === 'error'"
        >
          <span class="font-bold mr-1">
            @switch (errorType) {
              @case ('spa') {
                [~] SPA:
              }
              @case ('clean') {
                [✓] OK:
              }
              @case ('error') {
                [!] Error:
              }
            }
          </span>
          {{ scanner.scanError() }}
        </div>
      }

      <!-- ── Barra de progreso infinita (solo durante el scan) ── -->
      @if (scanner.isScanning()) {
        <div class="scan-bar"></div>
      }
    </div>
  `,
})
export class UrlInputComponent implements OnDestroy {
  url = '';
  scanner = inject(ScannerService);

  // Signal para la fase actual que se muestra
  currentPhase = signal(SCAN_PHASES[0]);
  phaseVisible = signal(true);

  private phaseInterval: ReturnType<typeof setInterval> | null = null;
  private phaseIndex = 0;

  constructor() {
    // Effect reactivo: arranca/para el rotador de fases según isScanning
    effect(() => {
      if (this.scanner.isScanning()) {
        this.startPhaseRotation();
      } else {
        this.stopPhaseRotation();
      }
    });
  }

  // ── Getter del tipo de error para estilos ──
  get errorType(): 'spa' | 'clean' | 'error' | null {
    const err = this.scanner.scanError();
    if (!err) return null;
    if (err.startsWith('SPA Detectada')) return 'spa';
    if (err.startsWith('Sin fricción')) return 'clean';
    return 'error';
  }

  // Reemplaza startPhaseRotation() completo por esto:
  private startPhaseRotation(): void {
    this.phaseIndex = 0;
    this.currentPhase.set(SCAN_PHASES[0]);
    this.phaseVisible.set(true);

    this.phaseInterval = setInterval(() => {
      this.phaseIndex = (this.phaseIndex + 1) % SCAN_PHASES.length;

      // 1. Oculta el span (Angular lo destruye del DOM)
      this.phaseVisible.set(false);

      // 2. En el siguiente microtask, lo recrea con el nuevo texto
      setTimeout(() => {
        this.currentPhase.set(SCAN_PHASES[this.phaseIndex]);
        this.phaseVisible.set(true);
      }, 80);
    }, 900);
  }

  private stopPhaseRotation(): void {
    if (this.phaseInterval) {
      clearInterval(this.phaseInterval);
      this.phaseInterval = null;
    }
  }

  // ── Limpieza al destruir el componente ──
  ngOnDestroy(): void {
    this.stopPhaseRotation();
  }

  // ── Iniciar escaneo ──
  startScan(): void {
    if (!this.url) return;

    let targetUrl = this.url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
      this.url = targetUrl;
    }

    this.scanner.scanUrl(targetUrl);
  }
}
