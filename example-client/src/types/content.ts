import type { Elements, IContentItem, IContentItemElements } from "@kontent-ai/delivery-sdk";

export type AudienceCodename =
  | "new_visitors"
  | "returning_visitors"
  | "premium_members"
  | "enterprise_customers"
  | null;

export interface AudienceOption {
  readonly codename: AudienceCodename;
  readonly name: string;
}

export const AUDIENCES: ReadonlyArray<AudienceOption> = [
  { codename: null, name: "Base Content (No Audience)" },
  { codename: "new_visitors", name: "New Visitors" },
  { codename: "returning_visitors", name: "Returning Visitors" },
  { codename: "premium_members", name: "Premium Members" },
  { codename: "enterprise_customers", name: "Enterprise Customers" },
] as const;

export interface HeroSectionElements extends IContentItemElements {
  readonly headline: Elements.TextElement;
  readonly subheadline: Elements.TextElement;
  readonly cta_text: Elements.TextElement;
  readonly cta_url: Elements.TextElement;
  readonly personalization__variant_type: Elements.TaxonomyElement;
  readonly personalization__personalization_audience: Elements.TaxonomyElement;
  readonly personalization__content_variants: Elements.LinkedItemsElement<HeroSection>;
}

export type HeroSection = IContentItem<HeroSectionElements>;

export interface LandingPageElements extends IContentItemElements {
  readonly title: Elements.TextElement;
  readonly hero: Elements.LinkedItemsElement<HeroSection>;
}

export type LandingPage = IContentItem<LandingPageElements>;
