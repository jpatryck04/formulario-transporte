import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-indicador-carga',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="indicador-carga" *ngIf="visible">
      <div class="spinner"></div>
      <p>{{ mensaje }}</p>
    </div>
  `,
  styles: [`
    .indicador-carga {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      gap: 1rem;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    p {
      color: #666;
      margin: 0;
      font-size: 0.95rem;
    }
  `]
})
export class IndicadorCargaComponent {
  @Input() visible = false;
  @Input() mensaje = 'Cargando...';
}
