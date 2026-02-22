import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScannerService } from '../service/scanner';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4 mt-8">
      
      <!-- Panel de Contadores (Solo se muestra si hay elementos) -->
      @if (totalPoints() > 0) {
        <div class="flex flex-col sm:flex-row justify-between items-center bg-torus-panel border border-gray-800 p-4 rounded-lg mb-6 shadow-md">
          <div class="text-gray-300 mb-2 sm:mb-0">
            Elementos detectados: <span class="font-bold text-white ml-1">{{ totalPoints() }}</span>
          </div>
          
          <!-- Barra de progreso visual -->
          <div class="w-full sm:w-1/3 mx-4 bg-gray-800 rounded-full h-2.5 mb-2 sm:mb-0">
            <div class="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
                 [style.width.%]="(answeredPoints() / totalPoints()) * 100 || 0"></div>
          </div>

          <div class="text-gray-300">
            Respondidos: <span class="font-bold text-green-400 ml-1">{{ answeredPoints() }}</span>
          </div>
        </div>
      }

      <!-- Iteramos sobre la lista paginada en lugar de toda la lista -->
      @for (point of paginatedPoints(); track point.id) {
        <div class="bg-torus-panel border-l-4 p-5 rounded-r-lg transition-all"
             [class.opacity-50]="point.status === 'ignored'"
             [class.border-l-yellow-500]="point.status === 'pending'"
             [class.border-l-torus-critical]="point.status === 'critical'"
             [class.border-l-green-500]="point.status === 'answered'">
          
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-white font-bold text-lg">{{ point.intentQuestion }}</h3>
            <span class="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-400">
              ID: {{ point.id }}
            </span>
          </div>

          <pre class="bg-torus-bg p-3 rounded text-sm text-gray-400 overflow-x-auto mb-4 border border-gray-800"><code>{{ point.elementHtml }}</code></pre>

          @if (point.status === 'pending' || point.status === 'critical') {
            <!-- Cambiamos a flex-col para poner input arriba y botones abajo -->
            <div class="flex flex-col gap-3 mt-4">
              
              <input 
                type="text" 
                #answerInput 
                placeholder="Escribe la explicación para el LLM aquí..." 
                class="w-full bg-torus-bg border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-blue-500 transition-colors"
                (keydown.enter)="submitAnswer(point.id, answerInput.value)"
              >
              
              <div class="flex gap-3 justify-start items-center">
                <button 
                  (click)="submitAnswer(point.id, answerInput.value)"
                  class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded transition-colors font-medium">
                  Responder
                </button>
                <button 
                  (click)="mark(point.id, 'critical')"
                  class="bg-red-900 bg-opacity-20 text-red-400 border border-red-800 hover:bg-opacity-40 px-4 py-2 rounded transition-colors">
                  Marcar Crítico
                </button>
                <button 
                  (click)="mark(point.id, 'ignored')"
                  class="text-gray-500 hover:text-gray-300 px-4 py-2 transition-colors">
                  Ignorar
                </button>
              </div>

            </div>
          } @else if (point.status === 'answered') {
            <div class="bg-green-900 bg-opacity-20 border border-green-800 p-3 rounded mt-2">
              <span class="text-green-400 text-xs uppercase tracking-wider font-bold block mb-1">Respuesta guardada:</span>
              <p class="text-white">{{ point.userResponse }}</p>
            </div>
          }
        </div>
      }
      
      <!-- Mensaje inicial -->
      @if (totalPoints() === 0 && !scanner.isScanning()) {
        <div class="text-center text-gray-500 py-12 border border-dashed border-gray-800 rounded-lg">
          Esperando URL para iniciar el análisis semántico.
        </div>
      }

      <!-- Controles de Paginación -->
      @if (totalPages() > 1) {
        <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-800 text-sm">
          <button 
            (click)="prevPage()" 
            [disabled]="currentPage() === 1"
            class="px-4 py-2 rounded bg-torus-panel border border-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors">
            &larr; Anterior
          </button>
          
          <span class="text-gray-400">
            Página <span class="text-white font-bold">{{ currentPage() }}</span> de <span class="text-white font-bold">{{ totalPages() }}</span>
          </span>

          <button 
            (click)="nextPage()" 
            [disabled]="currentPage() === totalPages()"
            class="px-4 py-2 rounded bg-torus-panel border border-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors">
            Siguiente &rarr;
          </button>
        </div>
      }
    </div>
  `
})
export class AuditListComponent {
  scanner = inject(ScannerService);

  // --- ESTADOS DE PAGINACIÓN ---
  currentPage = signal(1);
  pageSize = 5;

  // --- SEÑALES COMPUTADAS (Se recalculan solas cuando frictionPoints cambia) ---
  
  totalPoints = computed(() => this.scanner.frictionPoints().length);
  
  answeredPoints = computed(() => 
    this.scanner.frictionPoints().filter(p => p.status === 'answered').length
  );

  totalPages = computed(() => 
    Math.ceil(this.totalPoints() / this.pageSize)
  );

  // Esta es la lista "recortada" que mostramos en el HTML
  paginatedPoints = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.scanner.frictionPoints().slice(start, end);
  });

  // --- ACCIONES DEL USUARIO ---

  submitAnswer(id: string, response: string) {
    if (response.trim()) {
      this.scanner.updatePointStatus(id, 'answered', response);
      
      // Opcional: Si el usuario responde el último de la página, y hay más páginas, podrías avanzarlo
      // automáticamente. Por ahora lo dejamos simple.
    }
  }

  mark(id: string, status: 'ignored' | 'critical') {
    this.scanner.updatePointStatus(id, status);
  }

  // --- MÉTODOS DE PAGINACIÓN ---

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.scrollToTop();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.scrollToTop();
    }
  }

  // Pequeña mejora UX: al cambiar de página, volver arriba.
  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
