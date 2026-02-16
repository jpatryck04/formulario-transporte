import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { ErrorHandlerService } from './error-handler.service';

@Component({
  selector: 'app-error-campo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-campo" *ngIf="control && control.invalid && control.touched">
      <small class="error-texto" *ngFor="let error of obtenerErrores()">
        {{ error }}
      </small>
    </div>
  `,
  styles: [`
    .error-campo {
      margin-top: 0.25rem;
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        max-height: 0;
      }
      to {
        opacity: 1;
        max-height: 500px;
      }
    }

    .error-texto {
      display: block;
      color: #c33;
      font-size: 0.85rem;
      padding: 0.25rem 0;
    }
  `]
})
export class ErrorCampoComponent {
  @Input() control: AbstractControl | null = null;

  constructor(private errorHandler: ErrorHandlerService) { }

  obtenerErrores(): string[] {
    if (!this.control || !this.control.errors) {
      return [];
    }

    return this.errorHandler.manejarErrorValidacion(this.control.errors);
  }
}
