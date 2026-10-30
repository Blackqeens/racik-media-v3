export interface CatalogIndexDocument {
    id: string;
    index_type: 'catalog';
    title: string;
    description: string;
    category: string;
    vendor_id: string;
    vendor_name: string;
    price_min: number;
    price_max: number;
    is_available: boolean;
    provenance_verified: boolean;
    vendor_trust_score: number;
    knowledge_multiplier: number;
    image_url?: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}
export interface ServiceIndexDocument {
    id: string;
    index_type: 'service';
    title: string;
    description: string;
    category: string;
    provider_id: string;
    provider_name: string;
    price_min: number;
    price_max: number;
    is_available: boolean;
    service_type: 'remote' | 'geolocated';
    base_lat?: number;
    base_lng?: number;
    operation_radius_km?: number;
    provider_trust_score: number;
    image_url?: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}
export interface ContentIndexDocument {
    id: string;
    index_type: 'content';
    title: string;
    summary: string;
    content_type: 'article' | 'paper' | 'journal' | 'event';
    author_id: string;
    author_name: string;
    category: string;
    tags: string[];
    published_at: string;
    updated_at: string;
}
export interface VendorIndexDocument {
    id: string;
    index_type: 'vendor';
    name: string;
    description: string;
    category: string;
    trust_score: number;
    is_verified: boolean;
    specializations: string[];
    created_at: string;
}
export type IndexDocument = CatalogIndexDocument | ServiceIndexDocument | ContentIndexDocument | VendorIndexDocument;
