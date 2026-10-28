/**
 * Image Registry for ABC Courier & Parcel Tracking
 * Images come in a later stage. All URLs are empty placeholders for now.
 */

export type ImageId =
  | 'IMG-01' // hero-banner (1600x900)
  | 'IMG-02' // logo (240x60)
  | 'IMG-03' // favicon (64x64)
  | 'IMG-04' // service-icon-standard (120x120)
  | 'IMG-05' // service-icon-express (120x120)
  | 'IMG-06' // service-icon-cod (120x120)
  | 'IMG-07' // service-icon-cargo (120x120)
  | 'IMG-08' // how-it-works-book (120x120)
  | 'IMG-09' // how-it-works-pickup (120x120)
  | 'IMG-10' // how-it-works-transit (120x120)
  | 'IMG-11' // how-it-works-delivery (120x120)
  | 'IMG-12' // about-team (1200x800)
  | 'IMG-13' // coverage-illustration (1200x800)
  | 'IMG-14' // rider-illustration (800x800)
  | 'IMG-15' // empty-state-parcel (400x300)
  | 'IMG-16'; // login-side-visual (1000x1200)

export interface ImageMetadata {
  id: ImageId;
  url: string;
  alt: string;
  width: number;
  height: number;
  label?: string;
}

export const IMAGES: Record<ImageId, ImageMetadata> = {
  'IMG-01': {
    id: 'IMG-01',
    url: '',
    alt: 'Modern courier sorting facility and fleet logistics dispatch',
    width: 1600,
    height: 900,
    label: 'Hero Logistics Banner',
  },
  'IMG-02': {
    id: 'IMG-02',
    url: '',
    alt: 'ABC Courier & Parcel Tracking Wordmark Logo',
    width: 240,
    height: 60,
    label: 'Company Brand Logo',
  },
  'IMG-03': {
    id: 'IMG-03',
    url: '',
    alt: 'ABC Logistics Favicon Icon',
    width: 64,
    height: 64,
    label: 'Brand Favicon',
  },
  'IMG-04': {
    id: 'IMG-04',
    url: '',
    alt: 'Standard Courier Delivery Service Icon',
    width: 120,
    height: 120,
    label: 'Standard Ground Service',
  },
  'IMG-05': {
    id: 'IMG-05',
    url: '',
    alt: 'Overnight Express Air Delivery Icon',
    width: 120,
    height: 120,
    label: 'Express Air Service',
  },
  'IMG-06': {
    id: 'IMG-06',
    url: '',
    alt: 'Cash on Delivery Collection Icon',
    width: 120,
    height: 120,
    label: 'COD Service',
  },
  'IMG-07': {
    id: 'IMG-07',
    url: '',
    alt: 'Bulk Freight and Cargo Service Icon',
    width: 120,
    height: 120,
    label: 'Freight Cargo',
  },
  'IMG-08': {
    id: 'IMG-08',
    url: '',
    alt: 'Step 1: Book online or request consignment dispatch',
    width: 120,
    height: 120,
    label: 'How It Works - Step 1',
  },
  'IMG-09': {
    id: 'IMG-09',
    url: '',
    alt: 'Step 2: Courier doorstep collection and barcode scanning',
    width: 120,
    height: 120,
    label: 'How It Works - Step 2',
  },
  'IMG-10': {
    id: 'IMG-10',
    url: '',
    alt: 'Step 3: Hub sorting and secure inter-city linehaul transit',
    width: 120,
    height: 120,
    label: 'How It Works - Step 3',
  },
  'IMG-11': {
    id: 'IMG-11',
    url: '',
    alt: 'Step 4: Doorstep delivery and COD collection',
    width: 120,
    height: 120,
    label: 'How It Works - Step 4',
  },
  'IMG-12': {
    id: 'IMG-12',
    url: '',
    alt: 'ABC logistics operations operations team and fleet sorting facility',
    width: 1200,
    height: 800,
    label: 'About ABC Operations Team',
  },
  'IMG-13': {
    id: 'IMG-13',
    url: '',
    alt: 'Pakistan regional logistics hubs and delivery sectors network map',
    width: 1200,
    height: 800,
    label: 'Hub Network & Delivery Coverage',
  },
  'IMG-14': {
    id: 'IMG-14',
    url: '',
    alt: 'ABC dispatch rider equipped with handheld scanner and thermal printer',
    width: 800,
    height: 800,
    label: 'Rider Fleet & Mobile Tech',
  },
  'IMG-15': {
    id: 'IMG-15',
    url: '',
    alt: 'Secure boxed parcel awaiting dispatch',
    width: 400,
    height: 300,
    label: 'Empty State Parcel',
  },
  'IMG-16': {
    id: 'IMG-16',
    url: '',
    alt: 'Portal operational overview and digital dispatch console',
    width: 1000,
    height: 1200,
    label: 'Login Portal Visual',
  },
};
