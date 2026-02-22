import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScannerService } from '../../service/scanner';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [FormsModule],
  styleUrl: "./auditList.css",
  template: `
    <div class="space-y-6 mt-8">
      
  <!-- Panel de Contadores (Solo se muestra si hay elementos) -->
  @if (totalPoints() > 0) {
    <div class="celestial-stats-panel">
      <div class="stat-item">
        <span class="stat-label">Elementos detectados:</span>
        <span class="stat-value">{{ totalPoints() }}</span>
      </div>
      
      <!-- Barra de progreso visual mejorada -->
      <div class="progress-container">
        <div class="progress-track">
          <div class="progress-fill" 
               [style.width.%]="(answeredPoints() / totalPoints()) * 100 || 0">
            <span class="progress-percentage">
              {{ ((answeredPoints() / totalPoints()) * 100 || 0).toFixed(0) }}%
            </span>
          </div>
        </div>
      </div>

      <div class="stat-item">
        <span class="stat-label">Respondidos:</span>
        <span class="stat-value stat-value-success">{{ answeredPoints() }}</span>
      </div>
    </div>
  }

  <!-- Iteramos sobre la lista paginada -->
  @for (point of paginatedPoints(); track point.id) {
    <div class="celestial-audit-card"
         [class.card-ignored]="point.status === 'ignored'"
         [class.card-pending]="point.status === 'pending'"
         [class.card-critical]="point.status === 'critical'"
         [class.card-answered]="point.status === 'answered'">
      
      <!-- Header del card -->
      <div class="card-header">
        <div class="card-title-section">
          <!-- Indicador de estado visual -->
          <div class="status-indicator"
               [class.status-pending]="point.status === 'pending'"
               [class.status-critical]="point.status === 'critical'"
               [class.status-answered]="point.status === 'answered'"
               [class.status-ignored]="point.status === 'ignored'">
            @switch (point.status) {
              @case ('pending') {
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                </svg>
              }
              @case ('critical') {
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              }
              @case ('answered') {
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              }
              @case ('ignored') {
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
                </svg>
              }
            }
          </div>
          <h3 class="card-title">{{ point.intentQuestion }}</h3>
        </div>
        <span class="card-id-badge">ID: {{ point.id }}</span>
      </div>

      <!-- Bloque de código HTML -->
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-label">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
            </svg>
            Elemento HTML
          </span>
        </div>
        <pre class="code-block"><code>{{ point.elementHtml }}</code></pre>
      </div>

      <!-- Área de respuesta/acciones -->
      @if (point.status === 'pending' || point.status === 'critical') {
        <div class="action-section">
          
          <div class="input-wrapper">
            <label class="input-label">Explicación para el LLM:</label>
            <textarea 
              #answerInput 
              rows="3"
              placeholder="Describe la intención semántica de este elemento para ayudar al LLM a comprenderlo correctamente..."
              class="celestial-textarea"
              (keydown.enter)="submitAnswer(point.id, answerInput.value); $event.preventDefault()"
            ></textarea>
            <span class="input-hint">Presiona Enter para enviar</span>
          </div>
          
          <div class="button-group">
            <button 
              (click)="submitAnswer(point.id, answerInput.value)"
              class="btn-primary">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Responder
            </button>
            <button 
              (click)="mark(point.id, 'critical')"
              class="btn-critical">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Marcar Crítico
            </button>
            <button 
              (click)="mark(point.id, 'ignored')"
              class="btn-ignore">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
              Ignorar
            </button>
          </div>

        </div>
      } @else if (point.status === 'answered') {
        <div class="answer-display">
          <div class="answer-header">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="answer-label">Respuesta guardada</span>
          </div>
          <p class="answer-text">{{ point.userResponse }}</p>
        </div>
      } @else if (point.status === 'ignored') {
        <div class="ignored-notice">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
          </svg>
          <span>Este elemento ha sido marcado como ignorado</span>
        </div>
      }
    </div>
  }
  
  <!-- Mensaje inicial -->
  @if (totalPoints() === 0 && !scanner.isScanning()) {
    <div class="empty-state">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <h3 class="empty-title">Esperando URL para análisis</h3>
      <p class="empty-description">Introduce una URL en el panel superior para iniciar el escaneo semántico</p>
    </div>
  }

  <!-- Controles de Paginación -->
  @if (totalPages() > 1) {
    <div class="pagination-controls">
      <button 
        (click)="prevPage()" 
        [disabled]="currentPage() === 1"
        class="pagination-btn pagination-btn-prev"
        [class.pagination-btn-disabled]="currentPage() === 1">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        <span>Anterior</span>
      </button>
      
      <div class="pagination-info">
        <span class="pagination-text">Página</span>
        <span class="pagination-current">{{ currentPage() }}</span>
        <span class="pagination-text">de</span>
        <span class="pagination-total">{{ totalPages() }}</span>
      </div>

      <button 
        (click)="nextPage()" 
        [disabled]="currentPage() === totalPages()"
        class="pagination-btn pagination-btn-next"
        [class.pagination-btn-disabled]="currentPage() === totalPages()">
        <span>Siguiente</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
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
