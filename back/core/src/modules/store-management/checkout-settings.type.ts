export interface CheckoutSettings {
  storeId: string;
  taxes: Record<string, unknown>;
  shipping: Record<string, unknown>;
  payments: Record<string, unknown>; // only public keys here
}

export interface CheckoutSettingsDTO {
  taxes?: Record<string, unknown>;
  shipping?: Record<string, unknown>;
  payments?: Record<string, unknown>;
}
