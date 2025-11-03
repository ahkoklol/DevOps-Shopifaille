export type NavKey = "header" | "footer";

export interface NavItem {
  title: string;
  url: string;
  order: number;
  target?: "_self" | "_blank";
}

export interface Navigation {
  id: string;
  storeId: string;
  key: NavKey;
  items: NavItem[];
}
