/**
 * SAMPLE SEED DATA
 * All values are mock/sample data and clearly marked as such.
 */

import {
  Branch,
  City,
  DeliveryZone,
  Profile,
  ShippingService,
  SystemSettings,
  PublicContent,
} from '@/types/domain';

export const SAMPLE_SYSTEM_SETTINGS: SystemSettings = {
  companyName: 'ABC',
  tagline: 'Reliable Courier Logistics & Seamless COD across Pakistan (SAMPLE — replace)',
  supportPhone: '+92 21 111 222 333 (SAMPLE — replace)',
  supportEmail: 'support@abc-courier.sample.pk (SAMPLE — replace)',
  headOfficeAddress: 'Plot 42, Korangi Industrial Area, Karachi, Pakistan (SAMPLE — replace)',
  trackingPrefix: 'ABC',
  currency: 'PKR',
  timezone: 'Asia/Karachi',
  codFeePkr: 50,
  fuelSurchargePercent: 5,
  gstPercent: 0,
  workingHours: 'Monday – Saturday: 9:00 AM to 7:00 PM (Asia/Karachi) (SAMPLE)',
  stats: [
    { label: 'Regional Sorting Hubs', value: '3 Hubs' },
    { label: 'Active Delivery Sectors', value: '13 Zones' },
    { label: 'Cities Network', value: '5 Metros' },
    { label: 'Tracked Consignments', value: '100% Barcoded' },
  ],
};

export const SAMPLE_CITIES: City[] = [
  { id: 'city-khi', code: 'KHI', name: 'Karachi', province: 'Sindh', isActive: true },
  { id: 'city-lhe', code: 'LHE', name: 'Lahore', province: 'Punjab', isActive: true },
  { id: 'city-isb', code: 'ISB', name: 'Islamabad', province: 'Islamabad Capital Territory', isActive: true },
  { id: 'city-rwp', code: 'RWP', name: 'Rawalpindi', province: 'Punjab', isActive: true },
  { id: 'city-fsd', code: 'FSD', name: 'Faisalabad', province: 'Punjab', isActive: true },
];

export const SAMPLE_BRANCHES: Branch[] = [
  {
    id: 'br-khi-01',
    code: 'KHI-HUB-01',
    name: 'Karachi Central Hub (SAMPLE)',
    cityId: 'city-khi',
    address: 'Sector 15, Korangi Industrial Area, Karachi (SAMPLE — replace)',
    phone: '+92 21 35001122 (SAMPLE — replace)',
    email: 'khi.central@abc-courier.sample.pk (SAMPLE — replace)',
    isHub: true,
    isActive: true,
  },
  {
    id: 'br-lhe-01',
    code: 'LHE-HUB-01',
    name: 'Lahore Main Branch (SAMPLE)',
    cityId: 'city-lhe',
    address: 'Gulberg III, Main Boulevard, Lahore (SAMPLE — replace)',
    phone: '+92 42 35789012 (SAMPLE — replace)',
    email: 'lhe.main@abc-courier.sample.pk (SAMPLE — replace)',
    isHub: true,
    isActive: true,
  },
  {
    id: 'br-isb-01',
    code: 'ISB-HUB-01',
    name: 'Islamabad Capital Hub (SAMPLE)',
    cityId: 'city-isb',
    address: 'I-9/2 Industrial Area, Islamabad (SAMPLE — replace)',
    phone: '+92 51 44332211 (SAMPLE — replace)',
    email: 'isb.hub@abc-courier.sample.pk (SAMPLE — replace)',
    isHub: true,
    isActive: true,
  },
];

export const SAMPLE_ZONES: DeliveryZone[] = [
  // Karachi Zones
  { id: 'zone-khi-1', cityId: 'city-khi', code: 'KHI-Z1', name: 'Clifton & DHA', branchId: 'br-khi-01', isActive: true, isRemote: false },
  { id: 'zone-khi-2', cityId: 'city-khi', code: 'KHI-Z2', name: 'PECHS, Gulshan & Bahadurabad', branchId: 'br-khi-01', isActive: true, isRemote: false },
  { id: 'zone-khi-3', cityId: 'city-khi', code: 'KHI-Z3', name: 'Korangi, Landhi & Malir', branchId: 'br-khi-01', isActive: true, isRemote: false },
  // Lahore Zones
  { id: 'zone-lhe-1', cityId: 'city-lhe', code: 'LHE-Z1', name: 'Gulberg & Model Town', branchId: 'br-lhe-01', isActive: true, isRemote: false },
  { id: 'zone-lhe-2', cityId: 'city-lhe', code: 'LHE-Z2', name: 'DHA Phases 1-8 & Cantt', branchId: 'br-lhe-01', isActive: true, isRemote: false },
  { id: 'zone-lhe-3', cityId: 'city-lhe', code: 'LHE-Z3', name: 'Johar Town, Wapda Town & Iqbal Town', branchId: 'br-lhe-01', isActive: true, isRemote: false },
  // Islamabad Zones
  { id: 'zone-isb-1', cityId: 'city-isb', code: 'ISB-Z1', name: 'Blue Area & Sectors F-6 to F-11', branchId: 'br-isb-01', isActive: true, isRemote: false },
  { id: 'zone-isb-2', cityId: 'city-isb', code: 'ISB-Z2', name: 'Sectors G-6 to G-11 & I-8 to I-10', branchId: 'br-isb-01', isActive: true, isRemote: false },
  { id: 'zone-isb-3', cityId: 'city-isb', code: 'ISB-Z3', name: 'Outskirts, Bahria Enclave & Rural ICT', branchId: 'br-isb-01', isActive: true, isRemote: true },
  // Rawalpindi Zones
  { id: 'zone-rwp-1', cityId: 'city-rwp', code: 'RWP-Z1', name: 'Saddar, Cantt & Westridge', branchId: 'br-isb-01', isActive: true, isRemote: false },
  { id: 'zone-rwp-2', cityId: 'city-rwp', code: 'RWP-Z2', name: 'Satellite Town & Murree Road', branchId: 'br-isb-01', isActive: true, isRemote: false },
  // Faisalabad Zones
  { id: 'zone-fsd-1', cityId: 'city-fsd', code: 'FSD-Z1', name: 'D-Ground & Peoples Colony', branchId: 'br-lhe-01', isActive: true, isRemote: false },
  { id: 'zone-fsd-2', cityId: 'city-fsd', code: 'FSD-Z2', name: 'Clock Tower & Ghulam Muhammad Abad', branchId: 'br-lhe-01', isActive: true, isRemote: false },
];

export const SAMPLE_SERVICES: ShippingService[] = [
  {
    id: 'srv-std',
    code: 'STD',
    name: 'Standard Delivery (SAMPLE)',
    description: 'Cost-effective door-to-door ground courier delivery connecting major hubs across Pakistan.',
    estimatedDeliveryDays: '2 - 3 Business Days',
    baseWeightKg: 1,
    baseRatePkr: 250,
    perAdditionalKgPkr: 150,
    isActive: true,
    allowsCod: true,
  },
  {
    id: 'srv-exp',
    code: 'EXP',
    name: 'Express Delivery (Overnight) (SAMPLE)',
    description: 'Priority courier with next business day arrival between major metropolitan logistics centers.',
    estimatedDeliveryDays: 'Next Business Day (24 hrs)',
    baseWeightKg: 1,
    baseRatePkr: 450,
    perAdditionalKgPkr: 250,
    isActive: true,
    allowsCod: true,
  },
];

export const SAMPLE_PUBLIC_CONTENT: PublicContent = {
  aboutText: [
    'ABC is a domestic courier logistics enterprise founded to provide modern, technology-enabled parcel transportation and cash management across Pakistan (SAMPLE — replace with corporate history).',
    'With dedicated operational sorting hubs situated in key commercial centers including Karachi, Lahore, and Islamabad, our linehaul network connects regional corridors with daily scheduled departures (SAMPLE — replace).',
    'We specialize in end-to-end parcel handling for individual retail shippers as well as scalable Cash on Delivery (COD) services for emerging and established digital merchants (SAMPLE — replace).',
  ],
  values: [
    {
      title: 'Reliability & Trust',
      description: 'Disciplined transit linehauls and verifiable chain-of-custody tracking on every parcel consignment.',
    },
    {
      title: 'Operational Velocity',
      description: 'Streamlined origin hub sorting and rapid last-mile dispatch to maintain prompt delivery commitments.',
    },
    {
      title: 'Transparent COD',
      description: 'Accurate cash collection, digital audit reconciliation, and predictable remittance settlements.',
    },
    {
      title: 'Customer Stewardship',
      description: 'Dedicated support helpdesk providing proactive resolution for shippers and consignees nationwide.',
    },
  ],
  howItWorks: [
    {
      stepNumber: 1,
      title: 'Book Parcel Online',
      description: 'Specify pickup details, destination city, package dimensions, and COD collection amount.',
      iconKey: 'step-book',
    },
    {
      stepNumber: 2,
      title: 'Doorstep Courier Collection',
      description: 'Our rider arrives at your address, verifies parcel weight, and attaches the barcoded Airway Bill.',
      iconKey: 'step-pickup',
    },
    {
      stepNumber: 3,
      title: 'Hub Sorting & Transit',
      description: 'Consignments are scanned through regional automated gateways and routed via secured linehauls.',
      iconKey: 'step-transit',
    },
    {
      stepNumber: 4,
      title: 'Doorstep Delivery & COD',
      description: 'Rider completes delivery at consignee doorstep and collects designated cash on delivery securely.',
      iconKey: 'step-delivered',
    },
  ],
  faqs: [
    {
      id: 'faq-1',
      category: 'General',
      question: 'What is ABC and which cities are currently served?',
      answer: 'ABC is a domestic courier company operating in major Pakistani cities including Karachi, Lahore, Islamabad, Rawalpindi, and Faisalabad. (SAMPLE — to be confirmed by ABC)',
    },
    {
      id: 'faq-2',
      category: 'Booking',
      question: 'What is the cutoff time for scheduling a same-day parcel pickup?',
      answer: 'Bookings scheduled before 2:00 PM (Asia/Karachi) are eligible for same-day doorstep collection in primary urban zones. (SAMPLE — to be confirmed by ABC)',
    },
    {
      id: 'faq-3',
      category: 'Booking',
      question: 'Are there packaging guidelines for fragile or valuable items?',
      answer: 'Items should be packaged in rigid corrugated boxes with protective bubble cushioning. Specific packaging requirements must be verified with our branch staff. (SAMPLE — to be confirmed by ABC)',
    },
    {
      id: 'faq-4',
      category: 'Tracking',
      question: 'How do I track the current transit status of my consignment?',
      answer: 'Enter your 14-character Airway Bill (e.g. ABC26123456784) in the tracking bar on our website to view dispatch scans and activity milestones.',
    },
    {
      id: 'faq-5',
      category: 'Tracking',
      question: 'Why has my tracking status not updated in several hours?',
      answer: 'Tracking statuses update when shipments arrive at checkpoints and sorting hubs. Long-haul linehaul journeys between distant cities may show in-transit until arrival at the destination gateway. (SAMPLE — to be confirmed by ABC)',
    },
    {
      id: 'faq-6',
      category: 'COD',
      question: 'How does Cash on Delivery (COD) collection work?',
      answer: 'The courier collects the designated amount from the consignee upon delivery. Shippers can track payment collection status through our portal. (SAMPLE — to be confirmed by ABC)',
    },
    {
      id: 'faq-7',
      category: 'COD',
      question: 'What is the standard COD remittance schedule for merchants?',
      answer: 'COD remittances are processed according to merchant agreements through commercial banking transfers. (SAMPLE — to be confirmed by ABC; real policy and schedule to be confirmed)',
    },
    {
      id: 'faq-8',
      category: 'Exceptions',
      question: 'What happens if the recipient is unavailable at the time of delivery?',
      answer: 'The courier logs a delivery attempt and the operations team reschedules delivery for the following business day. Up to three attempts are standard. (SAMPLE — to be confirmed by ABC)',
    },
    {
      id: 'faq-9',
      category: 'Exceptions',
      question: 'What is the return to sender (RTS) procedure for cancelled deliveries?',
      answer: 'If delivery cannot be completed after authorized attempts, return procedures are initiated back to the original shipper branch. (SAMPLE — to be confirmed by ABC; fees and timeline to be confirmed)',
    },
    {
      id: 'faq-10',
      category: 'Exceptions',
      question: 'What is the compensation policy for lost or damaged parcels?',
      answer: 'Liability and claim procedures are governed by the statutory carriage conditions. (SAMPLE — to be confirmed by ABC; claims policy and limits to be confirmed)',
    },
  ],
  termsSections: [
    {
      id: 'sec-contract',
      heading: '1. Contract of Carriage',
      body: 'By tendering a consignment to ABC, the shipper agrees to all applicable terms, conditions, and tariff rules established for domestic parcel conveyance in Pakistan. (SAMPLE — to be confirmed by ABC)',
    },
    {
      id: 'sec-prohibited',
      heading: '2. Prohibited & Restricted Items',
      body: 'Shippers must not tender contraband, dangerous goods, inflammable liquids, firearms, or items prohibited under the laws of Pakistan. (SAMPLE — to be confirmed by ABC)',
    },
    {
      id: 'sec-charges',
      heading: '3. Tariffs, Weight Verification & Surcharges',
      body: 'Consignment charges are assessed based on volumetric or actual dead weight, whichever is higher. Remote area surcharges may apply to designated outer zones. (SAMPLE — to be confirmed by ABC; rates and calculations to be confirmed)',
    },
    {
      id: 'sec-cod',
      heading: '4. Cash on Delivery (COD) Agreement',
      body: 'ABC acts as a limited collection agent for COD shipments. Remittance schedules and bank charges are subject to merchant agreements. (SAMPLE — to be confirmed by ABC)',
    },
    {
      id: 'sec-liability',
      heading: '5. Limitation of Liability',
      body: 'Liability for loss, damage, or delay is subject to standard terms of carriage and declared value insurance if purchased at booking. (SAMPLE — to be confirmed by ABC; limits and claim windows to be confirmed)',
    },
  ],
  privacySections: [
    {
      id: 'sec-privacy-collection',
      heading: '1. Personal Information We Collect',
      body: 'We collect sender and recipient contact details, physical delivery addresses, phone numbers, and consignment metadata necessary solely to fulfill courier delivery requests. (SAMPLE — to be confirmed by ABC)',
    },
    {
      id: 'sec-privacy-usage',
      heading: '2. Purpose and Operational Usage',
      body: 'Data is utilized to route shipments through hubs, coordinate doorstep delivery by dispatch couriers, and transmit SMS or digital status alerts. (SAMPLE — to be confirmed by ABC)',
    },
    {
      id: 'sec-privacy-disclosure',
      heading: '3. Third-Party Sharing & Storage',
      body: 'We do not sell personal contact data to external marketing vendors. Information is stored securely and disclosed solely to authorized operations staff and regulatory authorities where legally required. (SAMPLE — to be confirmed by ABC)',
    },
    {
      id: 'sec-privacy-retention',
      heading: '4. Consignment Record Retention',
      body: 'Shipment records and tracking milestones are retained in accordance with statutory accounting and tax compliance regulations. (SAMPLE — to be confirmed by ABC)',
    },
  ],
  lastUpdated: '16 October 2026',
};

export const SAMPLE_USERS: Profile[] = [
  {
    id: 'user-01',
    email: 'superadmin@abc.test',
    fullName: 'Zainab Ahmed',
    role: 'super_admin',
    phone: '+923001110001',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-02',
    email: 'ops@abc.test',
    fullName: 'Bilal Khan',
    role: 'ops_manager',
    phone: '+923001110002',
    isActive: true,
    createdAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'user-03',
    email: 'branch@abc.test',
    fullName: 'Hamza Tariq',
    role: 'branch_staff',
    branchId: 'br-khi-01',
    phone: '+923001110003',
    isActive: true,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'user-04',
    email: 'rider@abc.test',
    fullName: 'Tariq Mehmood',
    role: 'rider',
    riderId: 'rdr-01',
    branchId: 'br-khi-01',
    phone: '+923001110004',
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'user-05',
    email: 'finance@abc.test',
    fullName: 'Ayesha Siddiqui',
    role: 'finance',
    phone: '+923001110005',
    isActive: true,
    createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'user-06',
    email: 'merchant@abc.test',
    fullName: 'Kashif Trading Co.',
    role: 'merchant',
    merchantId: 'mer-01',
    phone: '+923001110006',
    isActive: true,
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'user-07',
    email: 'customer@abc.test',
    fullName: 'Maryam Raza',
    role: 'customer',
    phone: '+923001110007',
    isActive: true,
    createdAt: '2026-02-15T00:00:00Z',
  },
];
