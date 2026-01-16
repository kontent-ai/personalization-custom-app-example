import type { ElementModels, TaxonomyModels } from "@kontent-ai/management-sdk";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  ELEMENT_SUFFIXES,
  findElementIdByCodenameSuffix,
  TAXONOMY_CODENAMES,
  VARIANT_TYPE_TERMS,
} from "../constants/codenames.ts";
import { queryKeys } from "../constants/queryKeys.ts";
import { fetchItem, fetchTaxonomy, fetchVariant } from "../services/api.ts";
import type { CurrentItemData, VariantInfo, VariantsData } from "../types/variant.types.ts";
import { notNull } from "../utils/function.ts";

const referenceArraySchema = z.array(z.object({ id: z.string() }));

const findVariantTermId = (
  taxonomyTerms: ReadonlyArray<TaxonomyModels.Taxonomy>,
): string | undefined =>
  taxonomyTerms
    .map((term) =>
      term.codename === VARIANT_TYPE_TERMS.VARIANT ? term.id : findVariantTermId(term.terms),
    )
    .find((id) => id !== undefined);

const checkIsVariant = (
  variantElements: ReadonlyArray<ElementModels.ContentItemElement>,
  elementCodenames: ReadonlyMap<string, string>,
  variantTermId: string,
): boolean => {
  const variantTypeElementId = findElementIdByCodenameSuffix(
    elementCodenames,
    ELEMENT_SUFFIXES.VARIANT_TYPE,
  );

  if (!variantTypeElementId) {
    return false;
  }

  const variantTypeElement = variantElements.find((el) => el.element.id === variantTypeElementId);

  if (!variantTypeElement) {
    return false;
  }

  const parsed = referenceArraySchema.safeParse(variantTypeElement.value);
  if (!parsed.success) {
    return false;
  }

  return parsed.data.some((term) => term.id === variantTermId);
};

const extractLinkedItemIds = (
  variantElements: ReadonlyArray<ElementModels.ContentItemElement>,
  elementCodenames: ReadonlyMap<string, string>,
): ReadonlyArray<string> => {
  const contentVariantsElementId = findElementIdByCodenameSuffix(
    elementCodenames,
    ELEMENT_SUFFIXES.CONTENT_VARIANTS,
  );

  if (!contentVariantsElementId) {
    return [];
  }

  const contentVariantsElement = variantElements.find(
    (el) => el.element.id === contentVariantsElementId,
  );

  if (!contentVariantsElement) {
    return [];
  }

  const parsed = referenceArraySchema.safeParse(contentVariantsElement.value);

  if (!parsed.success) {
    return [];
  }

  return parsed.data.map((item) => item.id);
};

export const extractAudienceTermId = (
  variantElements: ReadonlyArray<ElementModels.ContentItemElement>,
  elementCodenames: ReadonlyMap<string, string>,
): string | null => {
  const audienceElementId = findElementIdByCodenameSuffix(
    elementCodenames,
    ELEMENT_SUFFIXES.PERSONALIZATION_AUDIENCE,
  );

  if (!audienceElementId) {
    return null;
  }

  const audienceElement = variantElements.find((el) => el.element.id === audienceElementId);

  if (!audienceElement) {
    return null;
  }

  const parsed = referenceArraySchema.safeParse(audienceElement.value);

  if (!parsed.success || parsed.data.length === 0) {
    return null;
  }

  return parsed.data[0]?.id ?? null;
};

const fetchOtherVariantsData = async (
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
    if (a.isBaseContent && !b.isBaseContent) return -1;
    if (!a.isBaseContent && b.isBaseContent) return 1;
    return 0;
  });
};

export const useExistingVariants = (
  environmentId: string,
  languageId: string,
  currentItemId: string,
  currentItemData: CurrentItemData,
): { variantsData: VariantsData } => {
  const { data: otherVariants } = useSuspenseQuery({
    queryKey: queryKeys.existingVariants(environmentId, currentItemId, languageId),
    queryFn: async () =>
      fetchOtherVariantsData(environmentId, languageId, currentItemId, currentItemData),
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
      otherVariants,
    },
  };
};
