export interface DomainEvent<T = Record<string, unknown>> {
    event_id: string;
    event_name: string;
    tenant_id: string;
    occurred_at: string;
    schema_version: number;
    payload: T;
}
export type CreateEventPayload<T = Record<string, unknown>> = Omit<DomainEvent<T>, 'event_id' | 'occurred_at'>;
