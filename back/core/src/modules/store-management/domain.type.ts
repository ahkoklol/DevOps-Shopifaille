export interface Domain {
  id: string;
  storeId: string;
  host: string;
  isPrimary: boolean;
  verificationStatus: "pending" | "verified" | "failed";
}

export interface DomainDTO {
  host: string;
}
