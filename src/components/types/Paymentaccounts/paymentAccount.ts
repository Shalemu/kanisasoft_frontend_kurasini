export interface PaymentAccount {
  logo_url: string;
  id: number;
  name: string;
  account_name: string;
  account_number: string;
  type: string;
  logo?: string;
  instructions?: string;
  sort_order: number;
  is_active: boolean;
}