import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

interface ShopDetail {
  _id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  logo: string;
  coverPhoto: string;
  openingHours: string;
  phone: string;
}

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shop-detail.component.html',
  styleUrls: ['./shop-detail.component.css']
})
export class ShopDetailComponent implements OnInit {

  shopId: string = '';
  shop: ShopDetail | null = null;

  private toutesLesBoutiques: ShopDetail[] = [
    {
      _id: '1',
      name: 'Fashion House',
      category: 'Mode & Vêtements',
      description: 'Les dernières tendances de la mode internationale. Retrouvez des collections exclusives de créateurs renommés, des vêtements casual aux tenues de soirée. Nous proposons aussi des services de retouches et conseils mode personnalisés.',
      location: 'Niveau 2, Section A',
      logo: 'https://images.unsplash.com/photo-1521334884684-d80222895322?w=200',
      coverPhoto: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
      openingHours: 'Lun - Sam : 9h00 - 21h00 | Dim : 10h00 - 19h00',
      phone: '+212 5 22 00 11 22'
    },
    {
      _id: '2',
      name: 'TechZone',
      category: 'Électronique',
      description: 'Smartphones, laptops, accessoires et produits high-tech des meilleures marques mondiales. Nos experts vous conseillent et vous accompagnent dans le choix de vos équipements technologiques.',
      location: 'Niveau 1, Section B',
      logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200',
      coverPhoto: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200',
      openingHours: 'Lun - Dim : 9h00 - 22h00',
      phone: '+212 5 22 00 33 44'
    },
    {
      _id: '3',
      name: 'Gourmet Palace',
      category: 'Restauration',
      description: 'Restaurant gastronomique proposant une cuisine locale et internationale raffinée. Nos chefs vous préparent des plats d\'exception dans une ambiance chaleureuse et élégante.',
      location: 'Niveau 3, Food Court',
      logo: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=200',
      coverPhoto: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
      openingHours: 'Mar - Dim : 12h00 - 23h00 | Lun : Fermé',
      phone: '+212 5 22 00 55 66'
    },
    {
      _id: '4',
      name: 'Beauty World',
      category: 'Beauté & Cosmétiques',
      description: 'Cosmétiques, parfums et soins de beauté des plus grandes maisons. Nos esthéticiennes professionnelles proposent aussi des soins du visage et du corps en cabine privée.',
      location: 'Niveau 2, Section C',
      logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200',
      coverPhoto: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200',
      openingHours: 'Lun - Sam : 10h00 - 20h00',
      phone: '+212 5 22 00 77 88'
    },
    {
      _id: '5',
      name: 'Sport Center',
      category: 'Sports & Loisirs',
      description: 'Articles et équipements sportifs pour tous les niveaux. Football, tennis, natation, fitness... Tout ce qu\'il faut pour pratiquer votre sport préféré dans les meilleures conditions.',
      location: 'Niveau 1, Section A',
      logo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200',
      coverPhoto: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200',
      openingHours: 'Lun - Sam : 9h00 - 21h00',
      phone: '+212 5 22 00 99 10'
    },
    {
      _id: '6',
      name: 'Kids Paradise',
      category: 'Autre',
      description: 'Jouets, vêtements et accessoires pour enfants de 0 à 14 ans. Un espace de jeu gratuit est disponible dans la boutique. Animations chaque weekend.',
      location: 'Niveau 2, Section D',
      logo: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=200',
      coverPhoto: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=1200',
      openingHours: 'Lun - Dim : 10h00 - 20h00',
      phone: '+212 5 22 11 22 33'
    },
    {
      _id: '7',
      name: 'Luxury Watches',
      category: 'Mode & Vêtements',
      description: 'Montres de luxe et bijouterie haut de gamme. Rolex, Omega, Cartier... Nos experts horlogers vous conseillent et prennent en charge l\'entretien de vos pièces précieuses.',
      location: 'Niveau 1, Section C',
      logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
      coverPhoto: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=1200',
      openingHours: 'Lun - Sam : 10h00 - 19h00',
      phone: '+212 5 22 44 55 66'
    },
    {
      _id: '8',
      name: 'Fresh Market',
      category: 'Restauration',
      description: 'Produits frais et épicerie fine de qualité. Fruits, légumes, fromages affinés, charcuteries artisanales et vins sélectionnés. Livraison à domicile disponible.',
      location: 'Niveau -1, Food Zone',
      logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
      coverPhoto: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200',
      openingHours: 'Lun - Dim : 7h00 - 22h00',
      phone: '+212 5 22 77 88 99'
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.shopId = this.route.snapshot.paramMap.get('id') || '';
    this.shop   = this.toutesLesBoutiques.find(b => b._id === this.shopId) || null;
  }

  avoirIconeCategorie(categorie: string): string {
    const icones: any = {
      'Mode & Vêtements':     '👔',
      'Électronique':         '📱',
      'Restauration':         '🍽️',
      'Beauté & Cosmétiques': '💄',
      'Sports & Loisirs':     '⚽',
      'Autre':                '🏪'
    };
    return icones[categorie] || '🏪';
  }

  getTelLink(): string {
    return this.shop ? 'tel:' + this.shop.phone.replace(/\s/g, '') : '#';
  }
}
