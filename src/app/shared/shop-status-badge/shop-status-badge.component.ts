import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpeningHour } from '../../features/models/shop.model';
import { OpeningHoursService, ShopStatus } from '../opening-hours.service';

@Component({
  selector: 'app-shop-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-status-badge.component.html',
  styleUrls: ['./shop-status-badge.component.css']
})
export class ShopStatusBadgeComponent implements OnInit, OnDestroy {

  @Input() openingHours?: OpeningHour[];
  @Input() showNextInfo: boolean = true; // afficher "Ferme à 21h00" ou non

  status!: ShopStatus;
  private interval: any;

  constructor(private openingHoursService: OpeningHoursService) {}

  ngOnInit(): void {
    this.updateStatus();
    // Recalcule toutes les minutes pour rester à jour
    this.interval = setInterval(() => this.updateStatus(), 60_000);
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }

  private updateStatus(): void {
    this.status = this.openingHoursService.getStatus(this.openingHours);
  }
}
