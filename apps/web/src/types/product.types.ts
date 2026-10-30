/**
 * product.types.ts — Marketplace product & service types for the frontend.
 * Ref: data-models.md §marketplace, marketplace-lifecycle.md
 */

export type CatalogStatus = 'draft' | 'under_review' | 'approved' | 'rejected' | 'archived';
export type CatalogType = 'physical' | 'digital' | 'service';

export interface Product {
  id: string;
  vendor_id: string;
  catalog_type: CatalogType;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock_qty?: number;
  status: CatalogStatus;
  created_at: string;
  images?: ProductImage[];
  vendor?: {
    id: string;
    business_name: string;
  };
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sort_order: number;
}

export type ServiceListingStatus = 'draft' | 'under_review' | 'approved' | 'archived';

export interface ServiceListing {
  id: string;
  vendor_id: string;
  title: string;
  description?: string;
  base_price: number;
  status: ServiceListingStatus;
  created_at: string;
  milestones?: ServiceMilestone[];
}

export interface ServiceMilestone {
  id: string;
  title: string;
  price: number;
  delivery_days: number;
  sort_order: number;
}
