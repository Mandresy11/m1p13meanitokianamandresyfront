import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent {
  @Input() titre   = 'Confirmer la suppression';
  @Input() message = 'Êtes-vous sûr de vouloir supprimer cet élément ?';
  @Input() visible = false;

  @Output() confirme = new EventEmitter<void>();
  @Output() annule   = new EventEmitter<void>();

  onConfirmer(): void { this.confirme.emit(); }
  onAnnuler():   void { this.annule.emit();   }
}
