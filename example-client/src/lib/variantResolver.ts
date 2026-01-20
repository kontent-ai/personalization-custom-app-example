import type { AudienceCodename, HeroSection } from "../types/content.ts";

/**
 * Resolves the appropriate content variant based on the current audience.
 *
 * @param baseItem - The base content item with content_variants linked
 * @param currentAudience - The current audience codename (null for base content)
 * @returns The matching variant or base content as fallback
 */
export const resolveVariant = (
  baseItem: HeroSection,
  currentAudience: AudienceCodename
): HeroSection => {
  // If no audience selected, return base item
  if (currentAudience === null) {
    return baseItem;
  }

  // Get all variants from the content_variants element
  const variants = baseItem.elements.personalization__content_variants.linkedItems;

  // Find variant matching current audience
  const matchingVariant = variants.find((variant) =>
    variant.elements.personalization__personalization_audience.value.some(
      (term) => term.codename === currentAudience
    )
  );

  // Return matching variant or base item as fallback
  return matchingVariant ?? baseItem;
};

/**
 * Gets the audience name from a hero section item.
 * Returns "Base Content" for base items, or the audience name for variants.
 */
export const getVariantAudienceName = (item: HeroSection): string => {
  const variantType = item.elements.personalization__variant_type.value[0];

  if (variantType?.codename === "base_content") {
    return "Base Content";
  }

  const audience = item.elements.personalization__personalization_audience.value[0];
  return audience?.name ?? "Unknown";
};
