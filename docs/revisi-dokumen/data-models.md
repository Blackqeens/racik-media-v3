| Dokumen | `data-models.md` |

| :--- | :--- |
| **Versi** | `2.0` |
| **Status** | **APPROVED / FROZEN** |
| **Teknologi Inti** | `System Architecture Blueprint` |

---

# RACIK MEDIA V3 - RELATIONAL DATA MODELS (BLUEPRINT)

> DDL di dokumen ini mendeskripsikan struktur relasi dan konvensi kolom. Kepemilikan tabel mengikuti `data-ownership.md`; status lintas-domain disinkronkan melalui `event-map.md`. Semua nilai status menggunakan `lowercase_snake_case` (ADR-001 D7). Tabel append-only tidak memiliki `updated_at`; tabel mutable memiliki `created_at` dan `updated_at`. `tenant_id` wajib pada semua tabel tenant-aware (`tenancy-model.md`).

---

## 1. IDENTITY DOMAIN SCHEMA

### Table: `users`
Anchors the absolute Single Account Policy. Owned by Identity domain.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    -- active, under_review, restricted, suspended, permanently_revoked
    kyc_tier VARCHAR(20) NOT NULL DEFAULT 'tier_1',
    -- tier_1 (member), tier_2 (author/seller/provider), tier_3 (distributor), tier_4 (enterprise)
    mfa_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `user_roles`
Additive role expansion per master identity. Owned by Identity domain.

```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    role_type VARCHAR(50) NOT NULL,
    -- member, author, seller, distributor, service_provider, moderator, admin
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    -- active, under_review, suspended
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role_type)
);
```

### Table: `individual_profiles`
Personal data for non-organizational accounts. Owned by Identity domain.

```sql
CREATE TABLE individual_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    full_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    phone_number VARCHAR(20),
    province VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `organization_profiles`
Corporate, cooperative, or institutional entity data. Owned by Identity domain.

```sql
CREATE TABLE organization_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    legal_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    entity_type VARCHAR(50) NOT NULL, -- pt, cv, koperasi, yayasan, other
    nib VARCHAR(50),
    npwp VARCHAR(30),
    legal_address TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `organization_representatives`
Accountable human representative for a legal entity. Owned by Identity domain.

```sql
CREATE TABLE organization_representatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    organization_profile_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    role_in_org VARCHAR(100) NOT NULL, -- director, commissioner, authorized_agent
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `verifications`
KYC/KYB verification gate. Owned by Identity domain.

```sql
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verification_type VARCHAR(30) NOT NULL, -- kyc, kyb
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- pending, under_review, approved, rejected, expired
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `verification_documents`
Encrypted file references for legal identity documents. Owned by Identity domain.

```sql
CREATE TABLE verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    verification_id UUID NOT NULL REFERENCES verifications(id) ON DELETE RESTRICT,
    document_type VARCHAR(50) NOT NULL, -- ktp, selfie_with_ktp, npwp, nib, siup, deed_of_establishment
    storage_path TEXT NOT NULL, -- encrypted path in storage/kyc/ or storage/kyb/
    file_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `verification_reviews`
Moderator review notes for verification tickets. Owned by Identity domain.

```sql
CREATE TABLE verification_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    verification_id UUID NOT NULL REFERENCES verifications(id) ON DELETE RESTRICT,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    recommendation VARCHAR(30) NOT NULL, -- approve, reject, request_revision
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 2. CONTENT DOMAIN SCHEMA

### Table: `content_items`
Knowledge platform content (Article, Paper, Journal, Event). Owned by Content domain.

```sql
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content_type VARCHAR(30) NOT NULL, -- article, paper, journal, event
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    -- draft, under_review, revision_requested, approved, published, archived, rejected
    geolocation_meta POINT, -- required for type = 'event'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `content_citations`
Academic citation validation (APA/MLA). Required for Paper/Journal. Owned by Content domain.

```sql
CREATE TABLE content_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE RESTRICT,
    citation_format VARCHAR(20) NOT NULL, -- apa, mla, platform_standard
    citation_text TEXT NOT NULL,
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `content_lifecycle_logs`
Immutable mutation trail for content status changes. Owned by Content domain.

```sql
CREATE TABLE content_lifecycle_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    content_id UUID NOT NULL,
    actor_id UUID,
    old_state VARCHAR(50),
    new_state VARCHAR(50) NOT NULL,
    rationale_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 3. MARKETPLACE DOMAIN SCHEMA

### Table: `catalog_items`
Unified product structure. Owned by Marketplace domain.

```sql
CREATE TABLE catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    vendor_id UUID NOT NULL, -- FK to vendors(id); owned by Vendor domain
    item_type VARCHAR(50) NOT NULL, -- retail, wholesale, online_service, local_service
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price_fixed NUMERIC(15,2), -- NULL for wholesale RFQ
    stock_quantity INT,
    knowledge_backed_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00
        CHECK (knowledge_backed_multiplier >= 1.00 AND knowledge_backed_multiplier <= 2.00),
    status VARCHAR(50) NOT NULL DEFAULT 'under_review',
    -- under_review, active, suspended, rejected, archived
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `price_anomaly_registry`
Anti-Price-War monitoring ledger. Owned by Marketplace domain.

```sql
CREATE TABLE price_anomaly_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    catalog_item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE RESTRICT,
    detected_price NUMERIC(15,2) NOT NULL,
    category_floor_price NUMERIC(15,2) NOT NULL,
    deviation_percentage NUMERIC(5,2) NOT NULL,
    anomaly_status VARCHAR(30) NOT NULL DEFAULT 'flagged', -- flagged, cleared, suppressed
    flagged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `catalog_change_logs`
Price/stock/metadata mutation trail. Owned by Marketplace domain.

```sql
CREATE TABLE catalog_change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    catalog_item_id UUID NOT NULL,
    actor_id UUID NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    -- create, price_update, stock_depletion, metadata_amendment, suspension
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4. PROVENANCE DOMAIN SCHEMA

### Table: `catalog_provenances`
Item origin story and cultural attribution. Owned by Provenance domain.

```sql
CREATE TABLE catalog_provenances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    catalog_item_id UUID NOT NULL UNIQUE REFERENCES catalog_items(id) ON DELETE RESTRICT,
    producer_origin TEXT NOT NULL,
    production_method TEXT NOT NULL,
    regional_heritage_story TEXT NOT NULL,
    cultural_attribution_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    certificate_hash TEXT,
    validation_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- pending, verified, rejected
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 5. SERVICE-MARKETPLACE DOMAIN SCHEMA

### Table: `service_listings`
Professional service catalog with geolocation support. Owned by Service-Marketplace domain.

```sql
CREATE TABLE service_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    vendor_id UUID, -- optional; links to vendor entity if provider is a Vendor
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    delivery_method VARCHAR(20) NOT NULL, -- remote, geolocated
    base_price NUMERIC(15,2) NOT NULL,
    base_location POINT, -- required if delivery_method = 'geolocated'
    service_operational_radius_meters INT, -- required if delivery_method = 'geolocated'
    status VARCHAR(30) NOT NULL DEFAULT 'under_review',
    -- under_review, active, suspended, rejected, archived
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `service_milestones`
Work milestone structure per service engagement. Owned by Service-Marketplace domain.

```sql
CREATE TABLE service_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    order_id UUID NOT NULL, -- FK to orders(id); owned by Order domain
    service_listing_id UUID NOT NULL REFERENCES service_listings(id) ON DELETE RESTRICT,
    milestone_order INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- pending, locked, in_progress, submitted, amendment_requested, completed, cancelled
    revision_count INT NOT NULL DEFAULT 0 CONSTRAINT check_revision_cap CHECK (revision_count <= 3),
    due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `service_presence_tokens`
Physical field presence validation evidence. Owned by Service-Marketplace domain.

```sql
CREATE TABLE service_presence_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    milestone_id UUID NOT NULL REFERENCES service_milestones(id) ON DELETE RESTRICT,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verification_method VARCHAR(30) NOT NULL, -- qr_scan, geofence_match, manual_moderator_override
    provider_coordinates POINT,
    client_coordinates POINT,
    distance_deviation_meters NUMERIC(10,2),
    verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `service_change_logs`
Scope/price/geofence modification audit trail. Owned by Service-Marketplace domain.

```sql
CREATE TABLE service_change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    service_id UUID NOT NULL,
    actor_id UUID NOT NULL,
    old_scope JSONB,
    new_scope JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 6. ORDER DOMAIN SCHEMA

### Table: `orders`
Commercial commitment contract. Owned by Order domain.

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_type VARCHAR(30) NOT NULL,
    -- product_retail, product_wholesale, service_remote, service_geolocated
    status VARCHAR(50) NOT NULL DEFAULT 'pending_payment',
    -- pending_payment, paid, in_fulfillment, completed, cancelled, disputed
    gross_amount NUMERIC(15,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'IDR',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `order_items`
Line items per order (product or service). Owned by Order domain.

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    entity_type VARCHAR(30) NOT NULL, -- catalog_item, service_listing
    entity_id UUID NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(15,2) NOT NULL,
    subtotal NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `escrow_contracts`
Isolated per-order fund contract. Owned by Escrow domain.

```sql
CREATE TABLE escrow_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id),
    channel_type VARCHAR(20) NOT NULL DEFAULT 'retail', -- retail, wholesale, service
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    currency CHAR(3) NOT NULL DEFAULT 'IDR',
    amount_total NUMERIC(14,2) NOT NULL CHECK (amount_total >= 0),
    platform_fee_deducted NUMERIC(14,2) NOT NULL DEFAULT 0,
    aml_hold BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'payment_detected',
    -- payment_detected, locked, in_transit, delivered, disputed, released, refunded, cancelled
    auto_release_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `escrow_milestone_tranches`
Per-milestone fund tranche for service orders. Owned by Escrow domain.

```sql
CREATE TABLE escrow_milestone_tranches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    escrow_contract_id UUID NOT NULL REFERENCES escrow_contracts(id) ON DELETE RESTRICT,
    milestone_id UUID NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'locked',
    -- locked, released, refunded, disputed
    submitted_at TIMESTAMPTZ,
    auto_release_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (escrow_contract_id, milestone_id)
);
```

### Table: `escrow_settlement_splits`
Split settlement calculation record. Owned by Escrow domain. Append-only.

```sql
CREATE TABLE escrow_settlement_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    escrow_contract_id UUID NOT NULL REFERENCES escrow_contracts(id),
    tranche_id UUID, -- NULL for non-milestone (retail/wholesale) settlement
    gross_amount NUMERIC(14,2) NOT NULL,
    platform_fee_percentage NUMERIC(5,4) NOT NULL,
    platform_fee_amount NUMERIC(14,2) NOT NULL,
    gateway_fee_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    vendor_final_payout NUMERIC(14,2) NOT NULL,
    disbursement_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `escrow_events`
Append-only chronological financial state log. Owned by Escrow domain.

```sql
CREATE TABLE escrow_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    escrow_contract_id UUID NOT NULL REFERENCES escrow_contracts(id),
    event_type VARCHAR(100) NOT NULL,
    -- funds_locked, tracking_inserted, fulfillment_confirmed, buyer_confirmed,
    -- auto_release_triggered, partial_split_approved, dispute_frozen,
    -- sla_auto_release, refund_executed
    actor_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 7. MODERATION DOMAIN SCHEMA

### Table: `moderation_tickets`
Central curation queue for all entity types. Owned by Moderation domain.

```sql
CREATE TABLE moderation_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    entity_type VARCHAR(50) NOT NULL,
    -- content_item, catalog_item, service_listing, identity_verification, report, dispute
    entity_id UUID NOT NULL,
    queue_type VARCHAR(50) NOT NULL,
    -- knowledge_queue, catalog_queue, service_queue, identity_queue, fraud_queue,
    -- report_queue, dispute_queue
    severity VARCHAR(20) NOT NULL DEFAULT 'standard', -- standard, major, critical
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- pending, assigned, revision_requested, under_panel_review, approved, rejected
    sla_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `moderation_assignments`
Ticket-to-moderator allocation with SLA enforcement. Owned by Moderation domain.

```sql
CREATE TABLE moderation_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    ticket_id UUID NOT NULL REFERENCES moderation_tickets(id) ON DELETE RESTRICT,
    moderator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sla_deadline TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `moderation_panel_reviews`
Multi-moderator consensus for major/critical severity tickets. Owned by Moderation domain.

```sql
CREATE TABLE moderation_panel_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    ticket_id UUID NOT NULL UNIQUE REFERENCES moderation_tickets(id) ON DELETE RESTRICT,
    required_votes INT NOT NULL DEFAULT 3,
    votes_approved INT NOT NULL DEFAULT 0,
    votes_rejected INT NOT NULL DEFAULT 0,
    final_decision VARCHAR(20), -- approved, rejected
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `moderation_panel_votes`
Individual moderator vote log. Append-only. Owned by Moderation domain.

```sql
CREATE TABLE moderation_panel_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    panel_review_id UUID NOT NULL REFERENCES moderation_panel_reviews(id) ON DELETE RESTRICT,
    moderator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    vote VARCHAR(20) NOT NULL, -- approve, reject
    rationale_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(panel_review_id, moderator_id)
);
```

### Table: `appeal_tickets`
Constitutional appeal pathway (7-day window). Owned by Moderation domain.

```sql
CREATE TABLE appeal_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    original_ticket_id UUID NOT NULL REFERENCES moderation_tickets(id) ON DELETE RESTRICT,
    appellant_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- pending, under_admin_arbitration, overturned, upheld
    evidence_text TEXT,
    governance_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 8. SECURITY DOMAIN SCHEMA

### Table: `security_incidents`
Anomaly detection and incident records. Owned by Security domain.

```sql
CREATE TABLE security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    incident_type VARCHAR(50) NOT NULL,
    -- mfa_failure, credential_stuffing, device_mismatch, geo_anomaly, sybil_detection
    severity_level VARCHAR(20) NOT NULL, -- medium, high, critical
    incident_status VARCHAR(30) NOT NULL DEFAULT 'open',
    -- open, investigating, mitigated, closed
    source_ip INET,
    metadata JSONB,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 9. GOVERNANCE DOMAIN SCHEMA

### Table: `governance_decisions`
Administrative arbitration and parameter changes. Owned by Governance domain.

```sql
CREATE TABLE governance_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    decision_type VARCHAR(50) NOT NULL,
    -- amend_parameter, override_dispute, trigger_lockdown, account_restoration,
    -- sanction_level_3, sanction_reversal, governance_review
    reference_id UUID, -- ticket_id, incident_id, appeal_id, or entity_id depending on context
    previous_value JSONB,
    new_value JSONB,
    rationale_statement TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 10. AUDIT DOMAIN SCHEMA

All audit tables are append-only. UPDATE/DELETE blocked by trigger. Purge only by scheduled retention job per `audit-strategy.md`. Owned by Audit domain.

### Table: `identity_audit_logs`

```sql
CREATE TABLE identity_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    correlation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    actor_id UUID,
    action_type VARCHAR(100) NOT NULL,
    -- role_activated, role_suspended, status_restricted, status_suspended,
    -- status_permanently_revoked, revalidation_expired, kyc_approved, kyc_rejected
    old_value JSONB,
    new_value JSONB,
    rationale_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_identity_audit_logs_user_id ON identity_audit_logs(user_id);
CREATE INDEX idx_identity_audit_logs_correlation_id ON identity_audit_logs(correlation_id);
```

### Table: `security_audit_logs`

```sql
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    correlation_id UUID NOT NULL,
    incident_id UUID, -- REFERENCES security_incidents(id); nullable for pre-incident logs
    actor_id UUID,
    action_type VARCHAR(100) NOT NULL,
    -- incident_detected, session_invalidated, account_locked, ip_blocked, admin_mitigated
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_security_audit_logs_incident_id ON security_audit_logs(incident_id);
```

### Table: `moderation_audit_logs`

```sql
CREATE TABLE moderation_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    correlation_id UUID NOT NULL,
    moderation_ticket_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    actor_id UUID,
    action_type VARCHAR(50) NOT NULL,
    -- ticket_assigned, revision_requested, approved, rejected,
    -- panel_vote_cast, appeal_resolved
    rationale_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_moderation_audit_logs_ticket_id ON moderation_audit_logs(moderation_ticket_id);
```

### Table: `financial_audit_logs`

```sql
CREATE TABLE financial_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    correlation_id UUID NOT NULL,
    escrow_contract_id UUID NOT NULL,
    order_id UUID NOT NULL,
    amount_locked NUMERIC(14,2),
    fee_deducted NUMERIC(14,2),
    release_state VARCHAR(50), -- released, refunded
    actor_id UUID,
    action_type VARCHAR(100) NOT NULL,
    -- locked, in_transit, delivered, released, refunded, disputed, aml_hold_set
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_financial_audit_logs_order_id ON financial_audit_logs(order_id);
CREATE INDEX idx_financial_audit_logs_correlation_id ON financial_audit_logs(correlation_id);
```

---

## 11. REPUTATION DOMAIN SCHEMA

### Table: `core_reputations`
Master score per user. Read model owned by Reputation domain.

```sql
CREATE TABLE core_reputations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    master_score NUMERIC(6,2) NOT NULL DEFAULT 100.00
        CHECK (master_score >= 0 AND master_score <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `reputation_events`
Append-only score mutation ledger. Source of truth. Owned by Reputation domain.

```sql
CREATE TABLE reputation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason_code VARCHAR(100) NOT NULL,
    -- knowledge_approved, order_fulfilled, provenance_verified,
    -- tracking_number_invalid, provenance_violation, penalty_reversed, inactivity_decay
    score_delta NUMERIC(7,2) NOT NULL,
    source_event_id UUID UNIQUE NOT NULL, -- Idempotency key (eventId from event-map)
    source_domain VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `reputation_decay_logs`
Inactivity decay records (>6 months). Append-only. Owned by Reputation domain.

```sql
CREATE TABLE reputation_decay_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    score_delta NUMERIC(7,2) NOT NULL, -- always negative; -5 per qualifying month
    reason_code VARCHAR(50) NOT NULL DEFAULT 'inactivity_decay',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 12. LOGISTICS DOMAIN SCHEMA

### Table: `logistics_change_logs`
Chain-of-custody fulfillment log. Append-only. Owned by Logistics domain.

```sql
CREATE TABLE logistics_change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    correlation_id UUID NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    tracking_record_id UUID NOT NULL,
    -- references encrypted tracking record in Logistics domain owner storage
    current_status VARCHAR(30) NOT NULL,
    -- manifested, in_transit, delivered, carrier_exception, tracking_invalid
    event_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_logistics_change_logs_order_id ON logistics_change_logs(order_id);
CREATE INDEX idx_logistics_change_logs_correlation_id ON logistics_change_logs(correlation_id);
```
