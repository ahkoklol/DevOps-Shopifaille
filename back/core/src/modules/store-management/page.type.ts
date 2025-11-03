export interface Page {
  id: string;
  storeId: string;
  slug: string;
  title: string;
  content: string;
  type: "legal" | "custom";
  isPublished: boolean;
  updatedAt: string;
}

export interface PageDTO {
  slug?: string;
  title: string;
  content: string;
  type: "legal" | "custom";
  isPublished?: boolean;
}
