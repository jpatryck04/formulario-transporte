import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alerta-validacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alerta" [ngClass]="'alerta-' + tipo" *ngIf="visible">
      <div class="alerta-contenido">
        <span class="icono">{{ obtenerIcono() }}</span>
        <div class="mensaje">
          <h4>{{ titulo }}</h4>
          <p>{{ mensaje }}</p>
          <ul *ngIf="detalles && detalles.length > 0">
            <li *ngFor="let detalle of detalles">{{ detalle }}</li>
          </ul>
        </div>
        <button (click)="cerrar()" class="btn-cerrar" aria-label="Cerrar alerta">×</button>
      </div>
    </div>
  `,
  styles: [`
    .alerta {
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 4px;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .alerta-contenido {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .icono {
      font-size: 1.5rem;
      flex-shrink: 0;
      width: 30px;
      text-align: center;
    }

    .mensaje {
      flex: 1;
    }

    .mensaje h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }

    .mensaje p {
      margin: 0 0 0.5rem 0;
      font-size: 0.95rem;
    }

    .mensaje ul {
      margin: 0.5rem 0 0 1.5rem;
      padding: 0;
    }

    .mensaje li {
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
    }

    .btn-cerrar {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .alerta-error {
      background-color: #fee;
      color: #c33;
      border-left: 4px solid #c33;
    }

    .alerta-error .btn-cerrar:hover {
      background-color: rgba(204, 51, 51, 0.1);
    }

    .alerta-success {
      background-color: #efe;
      color: #3c3;
      border-left: 4px solid #3c3;
    }

    .alerta-success .btn-cerrar:hover {
      background-color: rgba(51, 204, 51, 0.1);
    }

    .alerta-warning {
      background-color: #ffeaa7;
      color: #d63;
      border-left: 4px solid #d63;
    }

    .alerta-warning .btn-cerrar:hover {
      background-color: rgba(221, 102, 51, 0.1);
    }

    .alerta-info {
      background-color: #eef;
      color: #33c;
      border-left: 4px solid #33c;
    }

    .alerta-info .btn-cerrar:hover {
      background-color: rgba(51, 51, 204, 0.1);
    }
  `]
})
export class AlertaValidacionComponent {
  @Input() visible = false;
  @Input() tipo: 'error' | 'success' | 'warning' | 'info' = 'info';
  @Input() titulo = '';
  @Input() mensaje = '';
  @Input() detalles: string[] = [];

  @Output() cerrado = new EventEmitter<void>();

  cerrar(): void {
    this.visible = false;
    this.cerrado.emit();
  }

  obtenerIcono(): string {
    switch (this.tipo) {
      case 'error':
        return '✕';
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  }
}
