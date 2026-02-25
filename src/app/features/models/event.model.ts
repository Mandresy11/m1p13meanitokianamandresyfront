export interface Event {
  _id: string;
  title: string;
  description: string;
  eventDateTime: Date;
  shop: {
    _id: string;
    name: string;
    location: {
      level: number;
      section: string;
    };
  };
  location: string;
  category: {
    _id: string,
    name: string,
    description: string;
  };
  image?: string;
  price?: number;
  isFree: boolean;
}

export interface EventCategory {
    _id: string;
    name: string;
    description?: string;
  }
