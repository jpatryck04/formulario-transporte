import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-floating-back-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="floating-back-btn"
      (click)="volverAlMenu()"
      title="Volver al menú"
      aria-label="Volver al menú"
      *ngIf="mostrarBoton">
      ←
    </button>
  `,
  styles: [`
    .floating-back-btn {
      position: fixed;
      top: 20px;
      left: 20px;
      width: 55px;
      height: 55px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(52, 152, 219, 0.95) 0%, rgba(41, 128, 185, 0.95) 100%);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      font-size: 26px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      font-weight: bold;
    }

    .floating-back-btn:hover {
      background: linear-gradient(135deg, rgba(52, 152, 219, 1) 0%, rgba(41, 128, 185, 1) 100%);
      box-shadow: 0 8px 25px rgba(52, 152, 219, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
      transform: translateY(-3px) scale(1.08);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .floating-back-btn:active {
      transform: translateY(-1px) scale(0.96);
      box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    @media (max-width: 768px) {
      .floating-back-btn {
        width: 50px;
        height: 50px;
        font-size: 22px;
        top: 15px;
        left: 15px;
        box-shadow: 0 3px 12px rgba(52, 152, 219, 0.25);
      }
    }
  `]
})
export class FloatingBackButtonComponent implements OnInit, OnDestroy {
  mostrarBoton = false;
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Mostrar botón solo en rutas de formularios
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.mostrarBoton = event.url !== '/';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  volverAlMenu(): void {
    this.router.navigate(['/']);
  }
}
