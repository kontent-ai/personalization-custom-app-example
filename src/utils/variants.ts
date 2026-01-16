import type { VariantInfo, VariantsData } from "../types/variant.types.ts";

export const allVariants = (variants: VariantsData): readonly VariantInfo[] => [
  variants.editedVariant,
  ...variants.otherVariants,
];

export const extractUsedAudienceIds = (variants: VariantsData): ReadonlySet<string> =>
  new Set(
    allVariants(variants)
      .filter((v) => !v.isBaseContent && v.audienceTermId !== null)
      .map((v) => v.audienceTermId as string),
  );

export const findBaseContent = (variants: VariantsData): VariantInfo | undefined =>
  allVariants(variants).find((v) => v.isBaseContent);
