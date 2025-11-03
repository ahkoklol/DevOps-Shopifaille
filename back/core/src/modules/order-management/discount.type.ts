export interface ValidateDiscountRequest {
  code: string;
  storeId: string;
  items: { variantId: string; quantity: number; unitPrice: number }[];
}
export interface ValidateDiscountResponse {
  valid: boolean;
  type?: "PERCENT" | "FIXED";
  value?: number;
  reason?: string;
}
