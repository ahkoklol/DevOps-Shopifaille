import { StoreRepository } from "../repositories/store.repository.ts";
import { ThemeRepository } from "../repositories/theme.repository.ts";
import { NavigationRepository } from "../repositories/navigation.repository.ts";
import { PageRepository } from "../repositories/page.repository.ts";
import { DomainRepository } from "../repositories/domain.repository.ts";
import { PublicConfig } from "../public-config.type.ts";

export class PublicController {
  constructor(
    private stores: StoreRepository,
    private themes: ThemeRepository,
    private navs: NavigationRepository,
    private pages: PageRepository,
    private domains: DomainRepository,
  ) {}

  async getPublicConfig(storeId: string): Promise<PublicConfig | null> {
    const store = await this.stores.findById(storeId);
    if (!store) return null;

    const live = await this.themes.getLive(storeId);
    const header = await this.navs.get(storeId, "header");
    const footer = await this.navs.get(storeId, "footer");
    const pages = await this.pages.list(storeId);
    const domains = await this.domains.list(storeId);
    const primary = domains.find(d => d.isPrimary) ?? null;

    return {
      storeId,
      status: store.status,
      primaryDomain: primary?.host ?? null,
      currency: store.currency,
      locales: store.locales,
      theme: { version: live?.version ?? "v0", variables: live?.variables ?? {} },
      navigation: { header: header?.items ?? [], footer: footer?.items ?? [] },
      legalPages: pages
        .filter(p => p.type === "legal" && p.isPublished)
        .map(p => ({ slug: p.slug, title: p.title, content: p.content })),
    };
  }
}
