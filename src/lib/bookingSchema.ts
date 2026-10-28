import { z } from 'zod';
import { validatePkPhone } from './phone';
import { BOOKING_LIMITS } from '@/config/booking';
import { QuoteInput } from '@/services/contracts/rate.contract';
import { BookingDraft, DeliveryZone } from '@/types/domain';
import { toZonedTime } from 'date-fns-tz';
import { addDays, startOfDay, parseISO, isBefore, isAfter } from 'date-fns';
import { DEFAULT_TIMEZONE } from '@/config/constants';

/**
 * Custom Zod validator for Pakistani Phone numbers
 */
const pkPhoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .refine(
    (val) => validatePkPhone(val).isValid,
    {
      message: 'Enter a Pakistani mobile number like 0300 1234567 or landline like 021 34567890',
    }
  );

const optionalPkPhoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      return validatePkPhone(val).isValid;
    },
    {
      message: 'Enter a valid Pakistani alternate phone number (e.g. 0300 1234567)',
    }
  );

const optionalEmailSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    },
    {
      message: 'Please enter a valid email address',
    }
  );

/**
 * Step 1: Sender Schema
 */
export const senderStepSchema = z.object({
  name: z
    .string()
    .min(2, 'Sender name must be at least 2 characters')
    .max(80, 'Sender name cannot exceed 80 characters'),
  phone: pkPhoneSchema,
  email: optionalEmailSchema,
  address: z
    .string()
    .min(10, 'Pickup address must be at least 10 characters (include street/plot)')
    .max(250, 'Address cannot exceed 250 characters'),
  cityId: z.string().min(1, 'Please select sender origin city'),
  zoneId: z.string().min(1, 'Please select sender origin area/sector'),
  instructions: z.string().max(200, 'Instructions cannot exceed 200 characters').optional(),
});

export type SenderStepValues = z.infer<typeof senderStepSchema>;

/**
 * Step 2: Recipient Schema
 */
export const recipientStepSchema = z.object({
  name: z
    .string()
    .min(2, 'Recipient name must be at least 2 characters')
    .max(80, 'Recipient name cannot exceed 80 characters'),
  phone: pkPhoneSchema,
  altPhone: optionalPkPhoneSchema,
  address: z
    .string()
    .min(10, 'Delivery address must be at least 10 characters (include street/house no)')
    .max(250, 'Address cannot exceed 250 characters'),
  cityId: z.string().min(1, 'Please select recipient destination city'),
  zoneId: z.string().min(1, 'Please select recipient delivery area/sector'),
  instructions: z.string().max(200, 'Instructions cannot exceed 200 characters').optional(),
});

export type RecipientStepValues = z.infer<typeof recipientStepSchema>;

/**
 * Helper to validate pickup date in Asia/Karachi (today or later, within 14 days)
 */
export function validatePickupDateInKarachi(dateStr?: string): boolean {
  if (!dateStr) return false;
  try {
    const zonedNow = toZonedTime(new Date(), DEFAULT_TIMEZONE);
    const today = startOfDay(zonedNow);
    const maxDate = addDays(today, BOOKING_LIMITS.maxPickupDaysInAdvance);

    const inputDate = startOfDay(parseISO(dateStr));
    if (isNaN(inputDate.getTime())) return false;

    // Check not before today
    if (isBefore(inputDate, today)) return false;
    // Check not after 14 days
    if (isAfter(inputDate, maxDate)) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Step 3: Shipment & Service Schema
 */
export const shipmentStepSchema = z
  .object({
    categoryId: z.string().min(1, 'Please select a package category'),
    description: z
      .string()
      .min(3, 'Package description must be at least 3 characters')
      .max(200, 'Description cannot exceed 200 characters'),
    pieces: z.coerce
      .number({ message: 'Pieces must be a valid number' })
      .int('Pieces must be a whole number')
      .min(BOOKING_LIMITS.minPieces, 'Pieces must be at least 1')
      .max(BOOKING_LIMITS.maxPieces, `Pieces cannot exceed ${BOOKING_LIMITS.maxPieces}`),
    weightKg: z.coerce
      .number({ message: 'Weight must be a valid number' })
      .gt(0, 'Weight must be greater than 0 kg')
      .max(BOOKING_LIMITS.maxWeightKg, `Weight cannot exceed ${BOOKING_LIMITS.maxWeightKg} kg`),
    dimensionsCm: z
      .object({
        length: z.coerce.number().optional(),
        width: z.coerce.number().optional(),
        height: z.coerce.number().optional(),
      })
      .optional(),
    declaredValue: z.coerce.number().min(0, 'Declared value cannot be negative').optional(),
    serviceId: z.string().min(1, 'Please select a courier service mode'),
    pickupOption: z.enum(['pickup_from_address', 'drop_at_branch'], {
      message: 'Please choose a pickup option',
    }),
    preferredPickupDate: z.string().optional(),
    paymentMethod: z.enum(['cod', 'prepaid'], {
      message: 'Please select a payment method',
    }),
    codAmount: z.coerce.number().optional(),
    specialHandling: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Dimensions validation: all-or-none and > 0
    const dims = data.dimensionsCm;
    if (dims) {
      const { length, width, height } = dims;
      const hasAny = (length && length > 0) || (width && width > 0) || (height && height > 0);
      if (hasAny) {
        if (!length || length <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Length must be greater than 0 cm',
            path: ['dimensionsCm', 'length'],
          });
        }
        if (!width || width <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Width must be greater than 0 cm',
            path: ['dimensionsCm', 'width'],
          });
        }
        if (!height || height <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Height must be greater than 0 cm',
            path: ['dimensionsCm', 'height'],
          });
        }
      }
    }

    // COD validation
    if (data.paymentMethod === 'cod') {
      if (data.codAmount === undefined || data.codAmount === null || isNaN(data.codAmount) || data.codAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'COD amount must be greater than 0 for Cash on Delivery',
          path: ['codAmount'],
        });
      } else if (data.codAmount > BOOKING_LIMITS.maxCodAmountPkr) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `COD amount cannot exceed PKR ${BOOKING_LIMITS.maxCodAmountPkr.toLocaleString()}`,
          path: ['codAmount'],
        });
      }
    }

    // Preferred Pickup Date validation (required for pickup_from_address)
    if (data.pickupOption === 'pickup_from_address') {
      if (!data.preferredPickupDate || data.preferredPickupDate.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please choose a preferred courier pickup date',
          path: ['preferredPickupDate'],
        });
      } else if (!validatePickupDateInKarachi(data.preferredPickupDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Pickup date must be between today and next ${BOOKING_LIMITS.maxPickupDaysInAdvance} days (PKT)`,
          path: ['preferredPickupDate'],
        });
      }
    }
  });

export type ShipmentStepValues = z.infer<typeof shipmentStepSchema>;

/**
 * Combined Booking Draft Schema
 */
export const bookingDraftSchema = z.object({
  sender: senderStepSchema,
  recipient: recipientStepSchema,
  shipment: shipmentStepSchema,
});

/**
 * Pure helper to convert a BookingDraft into QuoteInput for live price estimation.
 * Rules:
 * - Remote zone sets isRemoteDestination = true.
 * - COD only when paymentMethod === 'cod'.
 * - Dimensions included if complete.
 */
export function bookingToQuoteInput(
  draft: Partial<BookingDraft>,
  zones?: DeliveryZone[]
): QuoteInput | null {
  const senderCityId = draft.sender?.cityId;
  const recipientCityId = draft.recipient?.cityId;
  const serviceId = draft.shipment?.serviceId;
  const weightKg = draft.shipment?.weightKg;

  if (!senderCityId || !recipientCityId || !serviceId || !weightKg || weightKg <= 0) {
    return null;
  }

  const destZoneId = draft.recipient?.zoneId;
  const isRemote = destZoneId
    ? zones?.find((z) => z.id === destZoneId)?.isRemote ?? false
    : false;

  const dims = draft.shipment?.dimensionsCm;
  const hasCompleteDimensions =
    dims &&
    dims.length !== undefined &&
    dims.length > 0 &&
    dims.width !== undefined &&
    dims.width > 0 &&
    dims.height !== undefined &&
    dims.height > 0;

  const isCod = draft.shipment?.paymentMethod === 'cod';
  const codAmount = isCod ? draft.shipment?.codAmount : undefined;

  const quoteInput: QuoteInput = {
    originCityId: senderCityId,
    destinationCityId: recipientCityId,
    serviceId,
    weightKg: Number(weightKg),
  };

  if (destZoneId) {
    quoteInput.destinationZoneId = destZoneId;
  }

  if (isRemote) {
    quoteInput.isRemoteDestination = true;
  }

  if (hasCompleteDimensions && dims) {
    quoteInput.lengthCm = dims.length;
    quoteInput.widthCm = dims.width;
    quoteInput.heightCm = dims.height;
  }

  if (isCod && codAmount && codAmount > 0) {
    quoteInput.codAmountPkr = codAmount;
  }

  return quoteInput;
}
