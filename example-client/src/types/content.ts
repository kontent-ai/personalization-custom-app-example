import {
  isPersonalizationAudiencesTaxonomyTermCodename,
  type PersonalizationAudiencesTaxonomyTermCodenames,
} from "./generated/taxonomies/personalization-audiences-taxonomy.generated.ts";

// Audience type that includes null for "no audience selected"
export type AudienceCodename = PersonalizationAudiencesTaxonomyTermCodenames | null;

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

export const isValidAudience = (value: string | null): value is AudienceCodename =>
  value === null || isPersonalizationAudiencesTaxonomyTermCodename(value);
