import type { AudienceCodename } from "../types/content.ts";
import type { HeroSectionType } from "../types/generated/types/hero-section-type.generated.ts";

/**
 * Resolves the appropriate content variant based on the current audience.
 *
 * @param baseItem - The base content item with content_variants linked
 * @param currentAudience - The current audience codename (null for base content)
 * @returns The matching variant or base content as fallback
 */
export const resolveVariant = (
  baseItem: HeroSectionType,
  currentAudience: AudienceCodename,
): HeroSectionType => {
  if (currentAudience === null) {
    return baseItem;
  }

  const variants = baseItem.elements.personalization__content_variants
    .linkedItems as ReadonlyArray<HeroSectionType>;

  const matchingVariant = variants.find((variant) =>
    variant.elements.personalization__personalization_audience.value.some(
      (term) => term.codename === currentAudience,
    ),
  );

  return matchingVariant ?? baseItem;
};

/**
 * Gets the audience name from a hero section item.
 * Returns "Base Content" for base items, or the audience name for variants.
 */
export const getVariantAudienceName = (item: HeroSectionType): string => {
  const variantType = item.elements.personalization__variant_type.value[0];

  if (variantType?.codename === "base_content") {
    return "Base Content";
  }

  const audience = item.elements.personalization__personalization_audience.value[0];
  return audience?.name ?? "Unknown";
};
