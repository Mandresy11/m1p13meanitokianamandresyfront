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
    phoneNumber?: string;
    openingHours?: OpeningHour[];
  }

  export interface Category {
    _id: string;
    name: string;
    icon: string;
    description?: string;
  }

  export interface OpeningHour {
    day: number;                 // 0 = Sunday, 1 = Monday, etc.
    isOpen: boolean;             // whether shop is open that day
    label: string | null;        // optional custom label
    periods: OpeningPeriod[];    // can support multiple periods per day
  }

  export interface OpeningPeriod {
    open: string;   // "08:00"
    close: string;  // "19:00"
  }
