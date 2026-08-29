import { MotorcycleCategory, MotorcycleModel, Product, Order, UserProfile } from '../types';

export const MOTORCYCLE_MODELS: MotorcycleModel[] = [
  {
    id: 'xrm-125',
    name: 'Honda XRM 125',
    brand: 'Honda',
    displacement: '125cc SOHC',
    type: 'underbone',
    popularYears: '2008 - 2026 (Carb & Fi Motard/DS)',
  },
  {
    id: 'click-125',
    name: 'Honda Click 125i / 160',
    brand: 'Honda',
    displacement: '125cc / 157cc eSP+',
    type: 'scooter',
    popularYears: '2018 - 2026 (V1, V2 Game Changer, V3)',
  },
  {
    id: 'aerox-155',
    name: 'Yamaha Aerox 155',
    brand: 'Yamaha',
    displacement: '155cc VVA Liquid-Cooled',
    type: 'scooter',
    popularYears: '2017 - 2026 (V1 & V2 Connected)',
  },
  {
    id: 'nmax-155',
    name: 'Yamaha NMAX 155',
    brand: 'Yamaha',
    displacement: '155cc VVA BlueCore',
    type: 'scooter',
    popularYears: '2016 - 2026 (V1, V2 ABS)',
  },
  {
    id: 'sniper-155',
    name: 'Yamaha Sniper 150 / 155',
    brand: 'Yamaha',
    displacement: '155cc VVA 6-Speed',
    type: 'underbone',
    popularYears: '2015 - 2026 (MX King, Sniper 155R)',
  },
  {
    id: 'raider-150',
    name: 'Suzuki Raider 150',
    brand: 'Suzuki',
    displacement: '147.3cc DOHC 4-Valve',
    type: 'underbone',
    popularYears: '2010 - 2026 (Carb & Fi King of Underbones)',
  },
  {
    id: 'mio-i125',
    name: 'Yamaha Mio i125 / Sporty',
    brand: 'Yamaha',
    displacement: '115cc - 125cc',
    type: 'scooter',
    popularYears: '2012 - 2026 (M3, Soul i, Sporty)',
  },
  {
    id: 'wave-125',
    name: 'Honda Wave 110 / 125',
    brand: 'Honda',
    displacement: '110cc - 125cc SOHC',
    type: 'underbone',
    popularYears: '2005 - 2026 (Wave Alpha, Wave Dash)',
  },
  {
    id: 'beat-110',
    name: 'Honda Beat 110 Fi',
    brand: 'Honda',
    displacement: '110cc eSP',
    type: 'scooter',
    popularYears: '2015 - 2026 (Street, Premium)',
  },
  {
    id: 'pcx-adv-160',
    name: 'Honda PCX 160 / ADV 160',
    brand: 'Honda',
    displacement: '157cc 4-Valve eSP+',
    type: 'scooter',
    popularYears: '2021 - 2026',
  },
];

export const CATEGORIES: MotorcycleCategory[] = [
  'All Parts',
  'Engine & Bore Kits',
  'Transmission & CVT',
  'Exhaust & Mufflers',
  'Braking System',
  'Suspension & Shocks',
  'Electrical & ECU',
  'Body & Fairings',
  'Tires & Wheels',
  'Lighting & Horns',
  'Maintenance & Oils',
];

// Preset photo options to assist sellers in quickly selecting high-quality imagery for their parts
export const SELLER_IMAGE_PRESETS = [
  {
    label: 'Cylinder Block / Bore Kit',
    url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
    category: 'Engine & Bore Kits'
  },
  {
    label: 'CVT Pulley / Drive Face',
    url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
    category: 'Transmission & CVT'
  },
  {
    label: 'Racing Exhaust Pipe',
    url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800&auto=format&fit=crop&q=80',
    category: 'Exhaust & Mufflers'
  },
  {
    label: 'Rear Gas Shock Absorber',
    url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&auto=format&fit=crop&q=80',
    category: 'Suspension & Shocks'
  },
  {
    label: 'Brembo / Disc Brake Caliper',
    url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
    category: 'Braking System'
  },
  {
    label: 'Racing ECU / Electrical',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    category: 'Electrical & ECU'
  },
  {
    label: 'Motorcycle Racing Rim & Tire',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
    category: 'Tires & Wheels'
  },
  {
    label: 'Engine Oil & Lubricant',
    url: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&auto=format&fit=crop&q=80',
    category: 'Maintenance & Oils'
  }
];

// No preloaded products — users list and sell their own products
export const INITIAL_PRODUCTS: Product[] = [];

// No preloaded orders — created on real user transactions
export const INITIAL_ORDERS: Order[] = [];

// No preloaded accounts — users register their own rider or seller profiles
export const INITIAL_USER: UserProfile | null = null;
