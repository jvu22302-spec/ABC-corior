/**
 * Booking Configuration Constants
 * Note: Category lists and limits marked as SAMPLE are simulated operational values.
 */

export interface ShipmentCategory {
  id: string;
  name: string;
  description: string;
  restrictedNote?: string;
}

// SAMPLE list: Documents, Clothing, Electronics, Cosmetics, Household items, Other
export const SHIPMENT_CATEGORIES: ShipmentCategory[] = [
  {
    id: 'cat-doc',
    name: 'Documents',
    description: 'Letters, legal contracts, business tenders, identity papers',
    restrictedNote: 'Original currency, passports and negotiable instruments strictly prohibited',
  },
  {
    id: 'cat-cloth',
    name: 'Clothing & Apparel',
    description: 'Garments, fabrics, stitched suits, shoes, textile accessories',
  },
  {
    id: 'cat-elec',
    name: 'Electronics & Gadgets',
    description: 'Mobile phones, computer parts, chargers, small household appliances',
    restrictedNote: 'Standalone lithium batteries and damaged cells are restricted from air carriage',
  },
  {
    id: 'cat-cosm',
    name: 'Cosmetics & Personal Care',
    description: 'Skincare, perfumes, makeup, hygiene items',
    restrictedNote: 'Aerosol sprays and volatile solvents require ground transport only',
  },
  {
    id: 'cat-house',
    name: 'Household & Home Decor',
    description: 'Kitchenware, small ornaments, bed linen, non-fragile crafts',
  },
  {
    id: 'cat-other',
    name: 'Other Goods',
    description: 'General domestic items not falling under restricted categories',
    restrictedNote: 'Subject to standard contraband inspection prior to branch acceptance',
  },
];

export const PICKUP_OPTIONS = [
  {
    id: 'pickup_from_address' as const,
    label: 'Doorstep Courier Pickup',
    description: 'ABC courier visits sender address on chosen date to collect parcel',
  },
  {
    id: 'drop_at_branch' as const,
    label: 'Drop at ABC Branch Hub',
    description: 'Sender hands over package directly at any ABC facilitation center',
  },
];

// Strict rule: ONLY 'cod' | 'prepaid' (do NOT add to_pay)
export const PAYMENT_METHODS = [
  {
    id: 'cod' as const,
    label: 'Cash on Delivery (COD)',
    description: 'Collect payment from recipient upon doorstep parcel delivery',
  },
  {
    id: 'prepaid' as const,
    label: 'Prepaid / Paid at Origin',
    description: 'Delivery charges paid by sender at booking or branch drop-off',
  },
];

export const BOOKING_LIMITS = {
  maxWeightKg: 70,
  minWeightKg: 0.1,
  maxPieces: 50,
  minPieces: 1,
  // SAMPLE constant: 100,000 PKR maximum cash collection per consignment
  maxCodAmountPkr: 100000,
  maxPickupDaysInAdvance: 14,
};
