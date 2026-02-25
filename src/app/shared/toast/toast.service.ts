import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  toasts = signal<Toast[]>([]);
  private nextId = 0;

  private ajouter(message: string, type: ToastType, duree = 3500): void {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.supprimer(id), duree);
  }

  supprimer(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  succes(message: string)     { this.ajouter(message, 'success'); }
  erreur(message: string)     { this.ajouter(message, 'error'); }
  avertissement(message: string) { this.ajouter(message, 'warning'); }
  info(message: string)       { this.ajouter(message, 'info'); }
}
