# EVENT MAP

| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `event-map.md` |
| **Versi** | 2.2 |
| **Status** | **Selaras untuk review; pengesahan arsitek senior menunggu** |
| **Pola Sistem** | **Asynchronous Event-Driven Architecture (EDA)** |

## A. KONVENSI KANONIK

Dokumen ini adalah satu-satunya katalog event resmi. `eventType` pada aplikasi menggunakan nama kanonik `domain.action` (lowercase); nama wire RabbitMQ diturunkan secara deterministik menjadi huruf besar dengan titik diganti `_`, misalnya `escrow.milestone_released` menjadi `ESCROW_MILESTONE_RELEASED`. Payload JSON memakai `camelCase`.

Setiap event hanya memiliki satu publisher, yaitu domain owner aggregate yang berubah. Moderation hanya menerbitkan `moderation.decision_made`; domain pemilik entitas menerapkan keputusan melalui layanan miliknya lalu menerbitkan event bisnis. Consumer hanya memperbarui read model/tabel miliknya sendiri.

Envelope wajib memuat `eventId`, `correlationId`, `eventType`, `aggregateId`, `timestamp` (UTC ISO-8601), `actorId` (nullable untuk job sistem bila tidak ada actor manusia), dan `payload`. Payload hanya memuat ID rujukan serta atribut bisnis minimum yang diperlukan. Dilarang membawa NIK, nomor rekening, email, token, kredensial, atau dokumen pribadi mentah. Pengiriman at-least-once; consumer wajib idempoten berdasarkan `eventId`.

## B. KATALOG EVENT RESMI

| Nama kanonik | Nama wire | Publisher | Consumer | Payload inti (camelCase) |
| :--- | :--- | :--- | :--- | :--- |
| `identity.role_activated` | `IDENTITY_ROLE_ACTIVATED` | Identity | Membership, Reputation, Notification | `userId`, `role`, `verificationId` |
| `identity.status_restricted` | `IDENTITY_STATUS_RESTRICTED` | Identity | Order, Escrow, Marketplace, Service-Marketplace, Content, Notification | `userId`, `status`, `reasonCode` |
| `identity.login_succeeded` | `IDENTITY_LOGIN_SUCCEEDED` | Identity | Audit, Security | `userId`, `sessionId`, `occurredAt` |
| `identity.logout` | `IDENTITY_LOGOUT` | Identity | Audit | `userId`, `sessionId`, `occurredAt` |
| `identity.password_changed` | `IDENTITY_PASSWORD_CHANGED` | Identity | Audit, Security, Notification | `userId`, `occurredAt` |
| `identity.mfa_changed` | `IDENTITY_MFA_CHANGED` | Identity | Audit, Security | `userId`, `occurredAt` |
| `identity.verification_decision_recorded` | `IDENTITY_VERIFICATION_DECISION_RECORDED` | Identity | Audit, Notification, Vendor | `userId`, `verificationId`, `verificationType`, `decision` |
| `membership.plan_changed` | `MEMBERSHIP_PLAN_CHANGED` | Membership | Audit, Notification | `userId`, `planId`, `occurredAt` |
| `vendor.team_member_changed` | `VENDOR_TEAM_MEMBER_CHANGED` | Vendor | Audit, Analytics | `vendorId`, `teamMemberId`, `action` |
| `content.submitted` | `CONTENT_SUBMITTED` | Content | Moderation, Audit | `contentId`, `contentType`, `authorId` |
| `content.published` | `CONTENT_PUBLISHED` | Content | Reputation, Search, Notification, Audit | `contentId`, `authorId`, `publishedAt` |
| `content.flagged` | `CONTENT_FLAGGED` | Content | Moderation, Audit | `contentId`, `reportId`, `reasonCode` |
| `content.updated` | `CONTENT_UPDATED` | Content | Search, Audit | `contentId`, `authorId`, `changeType` |
| `catalog.submitted` | `CATALOG_SUBMITTED` | Marketplace | Moderation, Audit | `catalogItemId`, `vendorId` |
| `catalog.approved` | `CATALOG_APPROVED` | Marketplace | Search, Reputation, Notification, Audit | `catalogItemId`, `vendorId`, `approvedAt` |
| `catalog.updated` | `CATALOG_UPDATED` | Marketplace | Search, Audit | `catalogItemId`, `vendorId`, `changeType` |
| `catalog.archived` | `CATALOG_ARCHIVED` | Marketplace | Search, Audit | `catalogItemId`, `vendorId`, `reasonCode` |
| `catalog.delisted` | `CATALOG_DELISTED` | Marketplace | Search, Audit | `catalogItemId`, `vendorId`, `reasonCode` |
| `catalog.anomaly_detected` | `CATALOG_ANOMALY_DETECTED` | Marketplace | Moderation, Audit, Notification | `catalogItemId`, `vendorId`, `anomalyId`, `severity` |
| `service.submitted` | `SERVICE_SUBMITTED` | Service-Marketplace | Moderation, Audit | `serviceId`, `providerId` |
| `service.approved` | `SERVICE_APPROVED` | Service-Marketplace | Search, Reputation, Notification, Audit | `serviceId`, `providerId`, `approvedAt` |
| `service.updated` | `SERVICE_UPDATED` | Service-Marketplace | Search, Audit | `serviceId`, `providerId`, `changeType` |
| `moderation.decision_made` | `MODERATION_DECISION_MADE` | Moderation | Owner domain, Governance, Audit | `ticketId`, `entityType`, `entityId`, `decision`, `reasonCode` |
| `order.created` | `ORDER_CREATED` | Order | Payment, Chat, Notification, Analytics | `orderId`, `buyerId`, `sellerId`, `orderType` |
| `order.cancelled` | `ORDER_CANCELLED` | Order | Payment, Escrow, Notification, Audit | `orderId`, `reasonCode` |
| `order.completed` | `ORDER_COMPLETED` | Order | Analytics, Notification, Audit | `orderId`, `completedAt` |
| `order.buyer_confirmed` | `ORDER_BUYER_CONFIRMED` | Order | Escrow, Audit | `orderId`, `buyerId`, `confirmedAt` |
| `payment.succeeded` | `PAYMENT_SUCCEEDED` | Payment | Order, Escrow, Notification, Audit | `paymentId`, `orderId`, `transactionRef`, `amount` |
| `order.escrow_locked` | `ORDER_ESCROW_LOCKED` | Escrow | Order, Vendor, Notification, Audit | `escrowContractId`, `orderId`, `lockedAt` |
| `escrow.milestone_released` | `ESCROW_MILESTONE_RELEASED` | Escrow | Order, Reputation, Payment, Audit | `escrowContractId`, `orderId`, `trancheId`, `vendorId`, `amount` |
| `escrow.disputed` | `ESCROW_DISPUTED` | Escrow | Moderation, Governance, Notification, Audit | `escrowContractId`, `orderId`, `disputeId`, `reasonCode` |
| `escrow.refund_executed` | `ESCROW_REFUND_EXECUTED` | Escrow | Payment, Order, Reputation, Audit | `escrowContractId`, `orderId`, `refundId`, `amount`, `reasonCode` |
| `logistics.manifested` | `LOGISTICS_MANIFESTED` | Logistics | Order, Escrow, Notification, Audit | `orderId`, `trackingRecordId`, `carrier` |
| `logistics.in_transit` | `LOGISTICS_IN_TRANSIT` | Logistics | Order, Escrow, Notification, Audit | `orderId`, `trackingRecordId`, `occurredAt` |
| `logistics.delivered` | `LOGISTICS_DELIVERED` | Logistics | Order, Escrow, Notification, Audit | `orderId`, `trackingRecordId`, `deliveredAt` |
| `logistics.tracking_invalid` | `LOGISTICS_TRACKING_INVALID` | Logistics | Moderation, Escrow, Reputation, Governance, Audit | `orderId`, `trackingRecordId`, `vendorId`, `reasonCode` |
| `provenance.verified` | `PROVENANCE_VERIFIED` | Provenance | Marketplace, Search, Reputation, Audit | `catalogItemId`, `provenanceId`, `verifiedAt` |
| `provenance.rejected` | `PROVENANCE_REJECTED` | Provenance | Marketplace, Moderation, Reputation, Audit | `catalogItemId`, `provenanceId`, `reasonCode` |
| `security.incident_critical` | `SECURITY_INCIDENT_CRITICAL` | Security | Identity, Governance, Audit, Notification | `incidentId`, `userId`, `reasonCode` |
| `governance.parameter_amended` | `GOVERNANCE_PARAMETER_AMENDED` | Governance | Marketplace, Escrow, Audit | `decisionId`, `parameterKey`, `effectiveAt` |
| `reputation.score_updated` | `REPUTATION_SCORE_UPDATED` | Reputation | Search, Marketplace, Vendor, Audit | `userId`, `score`, `reasonCode` |
| `notification.delivery_failed` | `NOTIFICATION_DELIVERY_FAILED` | Notification | Audit, Observability | `notificationId`, `channel`, `failureCode`, `attempt` |
| `analytics.page_view` | `ANALYTICS_PAGE_VIEW` | Analytics | Audit | `anonymousSessionId`, `pageType`, `occurredAt` |
| `search.query_recorded` | `SEARCH_QUERY_RECORDED` | Search | Analytics, Audit | `queryId`, `anonymousSessionId`, `occurredAt` |
| `content.viewed` | `CONTENT_VIEWED` | Content | Analytics, Audit | `contentId`, `anonymousSessionId`, `occurredAt` |

## C. ATURAN KEPEMILIKAN DAN PRIVASI

1. `content.published`, `catalog.approved`, dan `service.approved` diterbitkan oleh domain owner setelah menerima keputusan Moderation dan menyimpan perubahan statusnya.
2. `order.escrow_locked` diterbitkan Escrow setelah kontrak berhasil dikunci. Fulfillment/logistik hanya mengirim event ke Escrow; tidak mengubah kontrak atau order.
3. Penalti reputasi hanya diproses oleh Reputation dari event yang tervalidasi. Pembalikan penalti akibat banding berhasil harus memakai reason code pembalik dan event baru, tidak menghapus histori.
4. ID seperti `userId`, `vendorId`, dan `orderId` adalah referensi, bukan salinan profil. Detail sensitif diambil melalui API owner dengan otorisasi.
5. Jangan mengirim nomor resi, nama penerima, alamat, foto serah-terima, data rekening, atau raw response provider dalam event umum. Simpan di domain owner dan kirim ID rekamannya.

## D. COMPATIBILITY

Nama wire lama seperti `PRODUCT_CREATED`, `ACCOUNT_SUSPENDED`, `TRACKING_NUMBER_INVALID`, dan `ARTICLE_PUBLISHED` adalah alias deprecated. Publisher baru wajib menggunakan nama kanonik pada §B; alias hanya boleh dipertahankan sementara pada adapter kompatibilitas, tidak dicatat sebagai event kedua.
