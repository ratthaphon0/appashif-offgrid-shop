'use strict';

const { z } = require('zod');

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const nullableMoney = z.coerce.number().nonnegative().nullable().optional();
const imageSchema = z.object({
  label: z.string().trim().min(1).max(50),
  uri: z.string().url().max(2048),
  sortOrder: z.coerce.number().int().nonnegative().optional()
});

const productFields = z.object({
  id: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{1,63}$/).optional(),
  name: z.string().trim().min(2).max(160),
  categorySlug: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{1,63}$/),
  description: z.string().trim().min(1).max(5000),
  price: z.coerce.number().nonnegative(),
  originalPrice: nullableMoney,
  stock: z.coerce.number().int().nonnegative(),
  badge: z.string().trim().max(60).nullable().optional(),
  badgeColor: color.nullable().optional(),
  imageColor: color.nullable().optional(),
  accentColor: color.nullable().optional(),
  edition: z.string().trim().max(80).nullable().optional(),
  isActive: z.boolean().optional(),
  images: z.array(imageSchema).max(12).optional()
}).strict();

const productBody = productFields.refine(
  (value) => value.originalPrice == null || value.originalPrice >= value.price,
  {
    message: 'originalPrice must be greater than or equal to price',
    path: ['originalPrice']
  }
);

const productPatch = productFields.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const categoryBody = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{1,63}$/).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).max(100000).optional(),
  isActive: z.boolean().optional()
}).strict();

const categoryPatch = categoryBody.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const loginBody = z.object({
  email: z.string().trim().toLowerCase().email().max(190),
  password: z.string().min(8).max(128)
}).strict();

module.exports = {
  productFields,
  productBody,
  productPatch,
  categoryBody,
  categoryPatch,
  loginBody
};
