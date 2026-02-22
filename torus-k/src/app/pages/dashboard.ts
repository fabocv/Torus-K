import { Component } from '@angular/core';
import { AuditListComponent } from '../core/auditList';
import { ResponsePanelComponent } from '../core/responsePanel';
import { UrlInputComponent } from '../core/urlInput';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [UrlInputComponent, AuditListComponent, ResponsePanelComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6 min-h-screen">
      <!-- Header de la Aplicación -->
      <header class="mb-8 border-b border-gray-800 pb-4">
        <h1 class="text-3xl font-bold text-torus-accent font-mono tracking-tight">
          Torus K <span class="text-gray-600 text-lg">v1.0</span>
        </h1>
        <p class="text-torus-text text-sm mt-2">
          Traductor de Semántica para IA | Optimizador de <code>llms.txt</code>
        </p>
      </header>

      <!-- Layout Principal tipo "Console" -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Columna Izquierda: Escaneo y Auditoría (7 columnas de ancho) -->
        <div class="lg:col-span-7 flex flex-col gap-6">
          <app-url-input />
          <app-audit-list />
        </div>

        <!-- Columna Derecha: Salida Generada (5 columnas de ancho) -->
        <div class="lg:col-span-5 relative">
          <!-- position: sticky mantiene el panel visible al hacer scroll en la lista -->
          <div class="sticky top-6">
            <app-response-panel />
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent {}
