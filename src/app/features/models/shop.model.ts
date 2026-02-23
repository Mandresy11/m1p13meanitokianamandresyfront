export interface Shop {
  _id: string;
  name: string;
  description: string;
  location: {
    level: number;
    section: string;
  };
  category: string;
  logo?: string;
  coverPhoto?: string;
  openingHours?: {
    day: string;
    open: string;
    close: string;
  }[];
}

export enum Category {
  MODE = 'Mode & Vêtements',
  ELECTRONIQUE = 'Électronique',
  RESTAURATION = 'Restauration',
  BEAUTE = 'Beauté & Cosmétiques',
  SPORT = 'Sports & Loisirs',
  AUTRE = 'Autre'
}
