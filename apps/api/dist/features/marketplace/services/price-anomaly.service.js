"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PriceAnomalyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceAnomalyService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../../core/database/supabase.client");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
const CATEGORY_FLOOR_PRICES = {
    default: 10000,
};
let PriceAnomalyService = PriceAnomalyService_1 = class PriceAnomalyService {
    constructor(supabase, eventBus) {
        this.supabase = supabase;
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(PriceAnomalyService_1.name);
    }
    async detectAnomaly(category, price) {
        const floor = CATEGORY_FLOOR_PRICES[category] ?? CATEGORY_FLOOR_PRICES['default'];
        return price < floor;
    }
    async recordAnomaly(catalogItemId, detectedPrice, category, tenantId, vendorId) {
        const floor = CATEGORY_FLOOR_PRICES[category] ?? CATEGORY_FLOOR_PRICES['default'];
        const deviation = ((floor - detectedPrice) / floor) * 100;
        const { data, error } = await this.supabase.admin
            .from('price_anomaly_registry')
            .insert({ catalog_item_id: catalogItemId, tenant_id: tenantId, detected_price: detectedPrice, category_floor_price: floor, deviation_percentage: deviation, anomaly_status: 'flagged' })
            .select().single();
        if (error) {
            this.logger.error('Failed to record anomaly', error);
            return;
        }
        await this.eventBus.publish({ event_name: 'catalog.anomaly_detected', tenant_id: tenantId, schema_version: 1, payload: { catalogItemId, vendorId, anomalyId: data.id, severity: deviation > 50 ? 'critical' : 'major' } });
    }
};
exports.PriceAnomalyService = PriceAnomalyService;
exports.PriceAnomalyService = PriceAnomalyService = PriceAnomalyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_client_1.SupabaseClientService,
        event_bus_service_1.EventBusService])
], PriceAnomalyService);
//# sourceMappingURL=price-anomaly.service.js.map