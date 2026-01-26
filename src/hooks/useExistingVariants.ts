import type { ElementModels } from "@kontent-ai/management-sdk";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ELEMENT_SUFFIXES, TAXONOMY_CODENAMES } from "../constants/codenames.ts";
import { queryKeys } from "../constants/queryKeys.ts";
import { fetchItem, fetchTaxonomy, fetchVariant } from "../services/api.ts";
import type { CurrentItemData, VariantInfo, VariantsData } from "../types/variant.types.ts";
import { checkIsVariant, getReferencesByCodenameSuffix } from "../utils/elementUtils.ts";
import { notNull } from "../utils/function.ts";
import { findVariantTermId } from "../utils/taxonomy-utils.ts";

const extractLinkedItemIds = (
  variantElements: ReadonlyArray<ElementModels.ContentItemElement>,
  elementCodenames: ReadonlyMap<string, string>,
): ReadonlyArray<string> => {
  const references = getReferencesByCodenameSuffix(
    variantElements,
    elementCodenames,
    ELEMENT_SUFFIXES.CONTENT_VARIANTS,
  );

  return references?.map((item) => item.id) ?? [];
};

export const extractAudienceTermId = (
  variantElements: ReadonlyArray<ElementModels.ContentItemElement>,
  elementCodenames: ReadonlyMap<string, string>,
): string | null => {
  const references = getReferencesByCodenameSuffix(
    variantElements,
    elementCodenames,
    ELEMENT_SUFFIXES.PERSONALIZATION_AUDIENCE,
  );

  return references?.[0]?.id ?? null;
};

const fetchLinkedVariantsData = async (
  environmentId: string,
  languageId: string,
  currentItemId: string,
  currentItemData: CurrentItemData,
): Promise<ReadonlyArray<VariantInfo>> => {
  if (!currentItemData.hasSnippet) {
    return [];
  }

  const linkedItemIds = extractLinkedItemIds(
    currentItemData.variant.elements,
    currentItemData.elementCodenames,
  );

  if (linkedItemIds.length === 0) {
    return [];
  }

  const taxonomyResult = await fetchTaxonomy(environmentId, TAXONOMY_CODENAMES.VARIANT_TYPE);

  const variantTermId = taxonomyResult.data
    ? findVariantTermId(taxonomyResult.data.terms)
    : undefined;

  if (!variantTermId) {
    throw new Error("Variant type taxonomy not found");
  }

  const variantPromises = linkedItemIds
    .filter((itemId) => itemId !== currentItemId)
    .map(async (itemId) => {
      const [itemResult, variantResult] = await Promise.all([
        fetchItem(environmentId, itemId),
        fetchVariant(environmentId, itemId, languageId),
      ]);

      if (itemResult.error || !itemResult.data) {
        return null;
      }

      if (variantResult.error || !variantResult.data) {
        return null;
      }

      const audienceTermId = extractAudienceTermId(
        variantResult.data.elements,
        currentItemData.elementCodenames,
      );

      const isVariant = checkIsVariant(
        variantResult.data.elements,
        currentItemData.elementCodenames,
        variantTermId,
      );

      return {
        id: itemId,
        name: itemResult.data.name,
        audienceTermId,
        isBaseContent: !isVariant,
      } satisfies VariantInfo;
    });

  const results = await Promise.all(variantPromises);
  const validVariants = results.filter(notNull);

  // Sort: base content first, then variants
  return validVariants.sort((a, b) => {
    if (a.isBaseContent && !b.isBaseContent) {
      return -1;
    }
    if (!a.isBaseContent && b.isBaseContent) {
      return 1;
    }
    return 0;
  });
};

export const useExistingVariants = (
  environmentId: string,
  languageId: string,
  currentItemId: string,
  currentItemData: CurrentItemData,
): { variantsData: VariantsData } => {
  const { data: linkedVariants } = useSuspenseQuery({
    queryKey: queryKeys.existingVariants(environmentId, currentItemId, languageId),
    queryFn: async () =>
      fetchLinkedVariantsData(environmentId, languageId, currentItemId, currentItemData),
  });

  const editedVariant: VariantInfo = {
    id: currentItemId,
    name: currentItemData.item.name,
    audienceTermId: extractAudienceTermId(
      currentItemData.variant.elements,
      currentItemData.elementCodenames,
    ),
    isBaseContent: !currentItemData.isVariant,
  };

  return {
    variantsData: {
      editedVariant,
      linkedVariants,
    },
  };
};
