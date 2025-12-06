export interface Admin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: Date;
}

// type pour l'authentification
export interface AdminDb {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: Date;
  password_hash: string | null;
}
