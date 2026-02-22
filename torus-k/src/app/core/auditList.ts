import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScannerService } from '../service/scanner';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4 mt-8">
      @for (point of scanner.frictionPoints(); track point.id) {
        <div class="bg-torus-panel border-l-4 p-5 rounded-r-lg"
             [class.opacity-50]="point.status === 'ignored'">
          
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-white font-bold text-lg">{{ point.intentQuestion }}</h3>
            <span class="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700">
              ID: {{ point.id }}
            </span>
          </div>

          <pre class="bg-torus-bg p-3 rounded text-sm text-gray-400 overflow-x-auto mb-4 border border-gray-800"><code>{{ point.elementHtml }}</code></pre>

          @if (point.status === 'pending' || point.status === 'critical') {
            <div class="flex gap-3 mt-4">
              <input 
                type="text" 
                #answerInput 
                placeholder="Explicación para el LLM..." 
                class="flex-1 bg-torus-bg border border-gray-700 p-2 rounded text-white focus:outline-none focus:border-torus-accent"
              >
              <button 
                (click)="submitAnswer(point.id, answerInput.value)"
                class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors">
                Responder
              </button>
              <button 
                (click)="mark(point.id, 'critical')"
                class="bg-torus-critical bg-opacity-20 text-torus-critical border border-torus-critical hover:bg-opacity-30 px-4 py-2 rounded transition-colors">
                Marcar Crítico
              </button>
              <button 
                (click)="mark(point.id, 'ignored')"
                class="text-gray-500 hover:text-white px-4 py-2 transition-colors">
                Ignorar
              </button>
            </div>
          } @else if (point.status === 'answered') {
            <div class="bg-green-900 bg-opacity-30 border border-green-800 p-3 rounded mt-2">
              <span class="text-torus-accent text-sm block mb-1">Respuesta guardada:</span>
              <p class="text-white">{{ point.userResponse }}</p>
            </div>
          }
        </div>
      }
      
      @if (scanner.frictionPoints().length === 0 && !scanner.isScanning()) {
        <div class="text-center text-gray-500 py-12">
          Esperando URL para iniciar el análisis semántico.
        </div>
      }
    </div>
  `
})
export class AuditListComponent {
  scanner = inject(ScannerService);

  submitAnswer(id: string, response: string) {
    if (response.trim()) {
      this.scanner.updatePointStatus(id, 'answered', response);
    }
  }

  mark(id: string, status: 'ignored' | 'critical') {
    this.scanner.updatePointStatus(id, status);
  }
}
