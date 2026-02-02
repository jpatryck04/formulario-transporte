import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="visible" (click)="onClose()">
      <div class="modal-contenedor" (click)="$event.stopPropagation()">
        <!-- Logo del ministerio -->
        <div class="modal-header-logo">
          <img src="assets/logo-ministerio.png" alt="Logo" class="modal-logo" onerror="this.style.display='none'">
        </div>

        <!-- Título y icono -->
        <div class="modal-header">
          <span class="modal-icono" [ngSwitch]="tipo">
            <span *ngSwitchCase="'error'" class="icono-error">⚠️</span>
            <span *ngSwitchCase="'success'" class="icono-success">✓</span>
            <span *ngSwitchCase="'warning'" class="icono-warning">⚠️</span>
            <span *ngSwitchCase="'info'" class="icono-info">ℹ️</span>
            <span *ngSwitchCase="'confirmacion'" class="icono-confirmacion">❓</span>
          </span>
          <h2 class="modal-titulo" [ngSwitch]="tipo">
            <span *ngSwitchCase="'error'">Error</span>
            <span *ngSwitchCase="'success'">Éxito</span>
            <span *ngSwitchCase="'warning'">Advertencia</span>
            <span *ngSwitchCase="'info'">Información</span>
            <span *ngSwitchCase="'confirmacion'">Confirmar</span>
          </h2>
        </div>

        <!-- Mensaje -->
        <div class="modal-mensaje">
          {{ mensaje }}
        </div>

        <!-- Botones -->
        <div class="modal-footer">
          <button 
            *ngIf="esConfirmacion" 
            (click)="onRechazar()" 
            class="btn btn-cancelar">
            CANCELAR
          </button>
          <button 
            (click)="onConfirmar()" 
            class="btn btn-aceptar">
            {{ esConfirmacion ? 'ACEPTAR' : 'CERRAR' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }

    .modal-contenedor {
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      padding: 20px;
      text-align: center;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header-logo {
      margin-bottom: 15px;
    }

    .modal-logo {
      max-width: 80px;
      height: auto;
    }

    .modal-header {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .modal-icono {
      font-size: 32px;
    }

    .modal-titulo {
      margin: 0;
      font-size: 20px;
      color: #333;
      font-weight: 600;
    }

    .modal-mensaje {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
      margin-bottom: 20px;
      min-height: 40px;
    }

    .modal-footer {
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 13px;
      transition: all 0.3s ease;
      flex: 1;
      max-width: 150px;
    }

    .btn-cancelar {
      background: #dc3545;
      color: white;
    }

    .btn-cancelar:hover {
      background: #c82333;
    }

    .btn-aceptar {
      background: #28a745;
      color: white;
    }

    .btn-aceptar:hover {
      background: #218838;
    }
  `]
})
export class ModalComponent {
  @Input() visible = false;
  @Input() mensaje = '';
  @Input() tipo: 'error' | 'success' | 'warning' | 'info' | 'confirmacion' = 'info';
  @Input() esConfirmacion = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<boolean>();

  constructor(private modalService: ModalService) {}

  onClose(): void {
    this.close.emit();
  }

  onConfirmar(): void {
    this.confirmar.emit(true);
    this.modalService.responderConfirmacion(true);
  }

  onRechazar(): void {
    this.confirmar.emit(false);
    this.modalService.responderConfirmacion(false);
  }
}
