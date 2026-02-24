export interface Shop {
  _id: string;
  name: string;
  description: string;
  location: {
    level: number;
    section: string;
  };
  category: {
    _id: string,
    name: string,
    icon: string,
    description: string;
  };
  logo?: string;
  coverPhoto?: string;
  openingHours?: {
    day: string;
    open: string;
    close: string;
  }[];
}

export interface Category {
  _id: string;
  name: string;
  icon: string;
  description?: string;
}
