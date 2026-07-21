import { z } from 'zod';

// 1. AUTH SCHEMAS
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid communications address.'),
  password: z.string().min(6, 'Password key validation expects minimum of 6 characters.')
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  fullName: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().optional()
});

// 2. PRODUCT SCHEMAS (Admin validations)
export const productSchema = z.object({
  name: z.string().min(2, 'Product identifier must have 2+ characters.'),
  basePrice: z.number().positive('Price module expects positive values.'),
  description: z.string().min(10, 'Details description expects 10+ characters.'),
  categoryId: z.string().uuid('Category pointer must be UUID format.').optional(),
  collectionId: z.string().uuid('Collection pointer must be UUID format.').optional(),
  images: z.array(z.string().url('Image link format must be valid url.')).min(1, 'Add at least one product media asset.'),
  isPublished: z.boolean().default(false)
});

// 3. ADDRESS SCHEMAS
export const addressSchema = z.object({
  street: z.string().min(5, 'Address details must be at least 5 characters.'),
  city: z.string().min(2, 'City parameter must be at least 2 characters.'),
  state: z.string().min(2, 'State parameter must be at least 2 characters.'),
  postalCode: z.string().min(5, 'Postal code must be at least 5 digits.'),
  country: z.string().default('India')
});

// 4. CHECKOUT SCHEMA
export const checkoutSchema = z.object({
  shippingAddressId: z.string().uuid('Shipping node ID must be a UUID.'),
  billingAddressId: z.string().uuid('Billing node ID must be a UUID.'),
  paymentProvider: z.enum(['razorpay', 'cod']),
  couponCode: z.string().optional()
});

// 5. REVIEW SCHEMA
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000, 'Max limit of comment is 1000 characters.').optional()
});
