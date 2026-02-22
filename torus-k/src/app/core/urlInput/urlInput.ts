import { Component, inject, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScannerService } from '../../service/scanner';

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
  styleUrls: ['./urlInput.css'],
  template: `
    <!-- Panel principal: posición relativa para la barra absoluta -->
<div
  class="relative celestial-panel p-6 rounded-xl border-2 shadow-2xl transition-all duration-500"
  [class.border-slate-300]="!scanner.isScanning()"
  [class.border-emerald-400]="scanner.isScanning()"
  [class.shadow-emerald-500/30]="scanner.isScanning()"
>
  <!-- ── Header con dots de estado ── -->
  <h2 class="celestial-panel-title text-2xl mb-5 flex items-center gap-3 font-bold">
    <span
      class="status-dot-enhanced"
      [class.dot-idle]="!scanner.isScanning() && !scanner.scanError()"
      [class.dot-scanning]="scanner.isScanning()"
      [class.dot-done]="!scanner.isScanning() && errorType === 'clean'"
      [class.dot-error]="
        !scanner.isScanning() && (errorType === 'error' || errorType === 'spa')
      "
    ></span>
    <span class="animate-pulse text-emerald-600">></span>
    Inicializar Escaneo Semántico
  </h2>

  <!-- ── Input + Botón ── -->
  <div class="flex flex-col sm:flex-row gap-4">
    <input
      type="url"
      [(ngModel)]="url"
      placeholder="https://ejemplo.com/app"
      class="flex-1 celestial-input p-3.5 rounded-lg font-mono text-base transition-all duration-300"
      [class.input-scanning]="scanner.isScanning()"
      (keyup.enter)="startScan()"
      [disabled]="scanner.isScanning()"
    />

    <button
      (click)="startScan()"
      [disabled]="scanner.isScanning() || !url"
      class="celestial-button px-7 py-3.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap overflow-hidden disabled:cursor-not-allowed shadow-lg"
      [class.btn-scanning]="scanner.isScanning()"
      [class.btn-ready]="!scanner.isScanning() && url"
      [class.btn-disabled]="!url && !scanner.isScanning()"
    >
      <!-- Ícono + texto del botón -->
      <span class="flex items-center gap-2.5">
        @if (scanner.isScanning()) {
          <!-- Spinner SVG mejorado -->
          <svg
            class="animate-spin h-5 w-5"
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
          <span class="font-semibold">Analizando...</span>
        } @else {
          <svg 
            class="h-5 w-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span class="font-semibold">Ejecutar Escáner</span>
        }
      </span>
    </button>
  </div>

  <!-- ── Fase de escaneo rotativa ── -->
  @if (scanner.isScanning()) {
    <div class="mt-5 flex items-center gap-2.5 font-mono text-sm celestial-phase-indicator">
      <span class="text-emerald-600 font-bold">[sys]</span>
      @if (phaseVisible()) {
        <span class="phase-text-enhanced"> {{ currentPhase() }} </span>
      }
    </div>
  }

  <!-- ── Feedback de resultado ── -->
  @if (!scanner.isScanning() && scanner.scanError()) {
    <div
      class="mt-5 p-4 rounded-lg border-2 font-mono text-sm transition-all duration-300 shadow-lg"
      [class.celestial-alert-spa]="errorType === 'spa'"
      [class.celestial-alert-success]="errorType === 'clean'"
      [class.celestial-alert-error]="errorType === 'error'"
    >
      <span class="font-bold mr-2 text-base">
        @switch (errorType) {
          @case ('spa') {
            <span class="inline-flex items-center gap-1.5">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              [~] SPA:
            </span>
          }
          @case ('clean') {
            <span class="inline-flex items-center gap-1.5">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              [✓] OK:
            </span>
          }
          @case ('error') {
            <span class="inline-flex items-center gap-1.5">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              [!] Error:
            </span>
          }
        }
      </span>
      {{ scanner.scanError() }}
    </div>
  }

  <!-- ── Barra de progreso infinita (solo durante el scan) ── -->
  @if (scanner.isScanning()) {
    <div class="celestial-scan-bar"></div>
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
