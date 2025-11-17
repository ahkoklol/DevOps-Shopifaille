export interface Customer {
  id: string;
  store_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_guest: boolean;
  created_at: Date;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  type: "billing" | "shipping";
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface CustomerOrderRef {
  customer_id: string;
  order_id: string;
  placed_at: Date;
  status: string;
  grand_total: number;
}