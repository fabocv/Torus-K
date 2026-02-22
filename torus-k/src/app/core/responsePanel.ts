import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScannerService } from '../service/scanner';

@Component({
  selector: 'app-response-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./panel.html"
})
export class ResponsePanelComponent {
  scanner = inject(ScannerService);
  
  // Signal para feedback visual al copiar
  copySuccess = signal<boolean>(false);

  // Computed: Verifica si hay puntos respondidos o críticos para mostrar el panel
  hasActionablePoints = computed(() => {
    return this.scanner.frictionPoints().some(
      p => p.status === 'answered' || p.status === 'critical'
    );
  });

  // Computed: Genera el texto estructurado amigable para LLMs
  generatedLlmText = computed(() => {
    const points = this.scanner.frictionPoints();
    const answered = points.filter(p => p.status === 'answered');
    const critical = points.filter(p => p.status === 'critical');

    let output = `# Manifiesto Semántico (Generado por Torus K)\n`;
    output += `> Instrucciones para el LLM: Utiliza este mapa semántico para entender la intención oculta de los elementos interactivos y dinámicos del DOM.\n\n`;

    if (answered.length > 0) {
      output += `## 1. Definiciones Semánticas Resolutivas\n`;
      answered.forEach(p => {
        // Limpiamos un poco el HTML para que sea más legible en texto plano
        const cleanHtml = p.elementHtml.replace(/\s+/g, ' ').trim();
        output += `- Elemento: \`${cleanHtml}\`\n`;
        output += `  Contexto/Regla de Negocio: "${p.userResponse}"\n\n`;
      });
    }

    if (critical.length > 0) {
      output += `## 2. Puntos Ciegos y Restricciones (Críticos)\n`;
      output += `> Advertencia: Los siguientes elementos carecen de contexto y deben ser tratados con precaución o ignorados en la generación de acciones.\n\n`;
      critical.forEach(p => {
        const cleanHtml = p.elementHtml.replace(/\s+/g, ' ').trim();
        output += `- Elemento Desconocido: \`${cleanHtml}\`\n`;
        output += `  Incertidumbre Detectada: ${p.intentQuestion}\n\n`;
      });
    }

    output = this.generateLlmsTxt(output);

    return output;
  });

  copyToClipboard() {
    navigator.clipboard.writeText(this.generatedLlmText()).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    });
  }

  generateLlmsTxt(content : string) {
    const instructions = `
### Instrucciones para la Configuración de llms.txt

Para asegurarte de que los modelos de lenguaje (LLMs) puedan acceder y utilizar correctamente el contenido de este archivo, sigue estos pasos:

1. **Ubicación**: Asegúrate de que el archivo \`llms.txt\` se encuentre en la raíz de tu dominio. Por ejemplo:
   - Si tu web es \`www.ejemplo.com\`, el archivo debe ser accesible en \`www.ejemplo.com/llms.txt\`.

2. **Formato**: Asegúrate de que el archivo esté en formato de texto plano (plain text) y que tenga la extensión \`.txt\`.

3. **Accesibilidad**: Verifica que no haya restricciones en el acceso al archivo por parte de los bots de búsqueda y agentes de IA. No debe haber autenticación requerida para acceder a este archivo.

4. **Actualización**: Revisa y actualiza \`llms.txt\` regularmente para reflejar cualquier cambio en tu sitio web, asegurando que los modelos tengan siempre la información más precisa.

Siguiendo estas instrucciones, podrás maximizar la efectividad de la optimización semántica de tu sitio web para modelos de lenguaje.
    `;
    
    const llmsOutput = content + instructions;
    return llmsOutput;
}


  downloadFile() {
    const blob = new Blob([this.generatedLlmText()], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'llms.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
