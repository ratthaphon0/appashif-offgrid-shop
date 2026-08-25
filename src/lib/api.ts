import { fallbackProducts, Product } from '@/constants/shop';

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'
).replace(/\/+$/, '');

export const CLOUD_DEPLOYMENT_LABEL =
  process.env.EXPO_PUBLIC_DEPLOYMENT_LABEL ?? 'LOCAL CLASSROOM API';

export type Category = {
  name: string;
  slug: string;
  productCount: number;
};

export type ProductInput = Omit<Product, 'id' | 'category' | 'categorySlug'> & {
  id?: string;
  categorySlug: string;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    requestId?: string;
  };
};

export class ApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;
  details?: unknown;

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.error?.code;
    this.requestId = body?.error?.requestId;
    this.details = body?.error?.details;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeProduct(value: unknown): Product {
  const item = asRecord(value);
  const imagesValue = Array.isArray(item.images) ? item.images : [];
  const images = imagesValue
    .map((image, index) => {
      const record = asRecord(image);
      const uri = asString(record.uri || record.url || record.image_url);
      return uri ? { label: asString(record.label, `VIEW ${index + 1}`), uri } : null;
    })
    .filter((image): image is { label: string; uri: string } => image !== null);

  return {
    id: asString(item.id || item.slug),
    name: asString(item.name),
    category: asString(item.category || item.category_name),
    categorySlug: asString(item.categorySlug || item.category_slug),
    description: asString(item.description),
    price: asNumber(item.price),
    originalPrice:
      item.originalPrice == null && item.original_price == null
        ? undefined
        : asNumber(item.originalPrice ?? item.original_price),
    stock: asNumber(item.stock),
    badge: asString(item.badge, 'NEW'),
    badgeColor: asString(item.badgeColor || item.badge_color, '#C8FF35'),
    imageColor: asString(item.imageColor || item.image_color, '#E8DCFF'),
    accentColor: asString(item.accentColor || item.accent_color, '#8B5CF6'),
    edition: asString(item.edition, 'NEW'),
    isActive:
      item.isActive != null
        ? Boolean(item.isActive)
        : item.is_active != null
        ? Boolean(item.is_active)
        : true,
    images: images.length ? images : fallbackProducts[0].images,
  };
}

function normalizeCategory(value: unknown): Category {
  const item = asRecord(value);
  return {
    name: asString(item.name),
    slug: asString(item.slug),
    productCount: asNumber(item.productCount ?? item.product_count ?? item.count),
  };
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const body = (await response.json().catch(() => ({}))) as ApiErrorBody & T;
  if (!response.ok) {
    throw new ApiError(body.error?.message ?? `API returned ${response.status}`, response.status, body);
  }
  return body;
}

function productPayload(input: ProductInput) {
  return {
    ...input,
    images: input.images.map((image, sortOrder) => ({ ...image, sortOrder })),
  };
}

export async function getProducts(
  params?: { search?: string; categorySlug?: string; sort?: string; active?: string },
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({ limit: '100', sort: params?.sort || 'name_asc' });
  if (params?.search?.trim()) query.set('search', params.search.trim());
  if (params?.categorySlug?.trim()) query.set('categorySlug', params.categorySlug.trim());
  const activeFilter = params?.active ?? 'all';
  if (activeFilter) query.set('active', activeFilter);

  const response = await request<{ data: unknown[] }>(`/products?${query.toString()}`, {
    signal,
  });
  return response.data.map(normalizeProduct).filter((product) => product.id && product.name);
}

export async function getProductById(id: string, includeInactive = true) {
  const response = await request<{ data: unknown }>(
    `/products/${encodeURIComponent(id)}?includeInactive=${includeInactive ? 'true' : 'false'}`,
  );
  return normalizeProduct(response.data);
}

export async function getCategories(signal?: AbortSignal) {
  const response = await request<{ data: unknown[] }>('/categories', { signal });
  return response.data.map(normalizeCategory).filter((category) => category.slug && category.name);
}

export async function createProduct(input: ProductInput, token: string) {
  const response = await request<{ data: unknown }>('/products', {
    method: 'POST',
    body: JSON.stringify(productPayload(input)),
    token,
  });
  return normalizeProduct(response.data);
}

export async function updateProduct(id: string, input: Partial<ProductInput> & { isActive?: boolean }, token: string) {
  const response = await request<{ data: unknown }>(`/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input.images ? productPayload(input as ProductInput) : input),
    token,
  });
  return normalizeProduct(response.data);
}

export async function deleteProduct(id: string, token: string, permanent = false) {
  await request(`/products/${encodeURIComponent(id)}${permanent ? '?permanent=true' : ''}`, {
    method: 'DELETE',
    token,
  });
}

export async function createCategory(name: string, token: string) {
  const response = await request<{ data: unknown }>('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
    token,
  });
  return normalizeCategory(response.data);
}

export async function updateCategory(slug: string, name: string, token: string) {
  const response = await request<{ data: unknown }>(`/categories/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
    token,
  });
  return normalizeCategory(response.data);
}

export async function deleteCategory(slug: string, token: string) {
  await request(`/categories/${encodeURIComponent(slug)}`, { method: 'DELETE', token });
}

export async function loginAdmin(email: string, password: string) {
  const response = await request<{
    data: { accessToken: string; admin?: { email?: string; displayName?: string } };
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return response.data;
}
