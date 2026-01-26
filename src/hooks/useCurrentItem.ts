import type { ContentTypeElements, LanguageVariantModels } from "@kontent-ai/management-sdk";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ELEMENT_SUFFIXES, TAXONOMY_CODENAMES } from "../constants/codenames.ts";
import { queryKeys } from "../constants/queryKeys.ts";
import { fetchContentType, fetchItem, fetchTaxonomy, fetchVariant } from "../services/api.ts";
import type { CurrentItemData } from "../types/variant.types.ts";
import { checkIsVariant, findElementIdByCodenameSuffix } from "../utils/elementUtils.ts";
import { findVariantTermId } from "../utils/taxonomy-utils.ts";

const buildElementCodenamesMap = (
  contentTypeElements: ReadonlyArray<ContentTypeElements.Element>,
  snippetElements: ReadonlyArray<ReadonlyArray<ContentTypeElements.Element>>,
): ReadonlyMap<string, string> => {
  const typeEntries = contentTypeElements
    .filter((el) => el.id && el.codename)
    .map((el) => [el.id, el.codename] as [string, string]);

  const snippetEntries = snippetElements
    .flat()
    .filter((el) => el.id && el.codename)
    .map((el) => [el.id, el.codename] as [string, string]);

  return new Map([...typeEntries, ...snippetEntries]);
};

const checkHasSnippet = (elementCodenames: ReadonlyMap<string, string>): boolean => {
  const variantTypeId = findElementIdByCodenameSuffix(
    elementCodenames,
    ELEMENT_SUFFIXES.VARIANT_TYPE,
  );
  const audienceId = findElementIdByCodenameSuffix(
    elementCodenames,
    ELEMENT_SUFFIXES.PERSONALIZATION_AUDIENCE,
  );
  const contentVariantsId = findElementIdByCodenameSuffix(
    elementCodenames,
    ELEMENT_SUFFIXES.CONTENT_VARIANTS,
  );

  return Boolean(variantTypeId && audienceId && contentVariantsId);
};

const fetchCurrentItemData = async (
  environmentId: string,
  itemId: string,
  languageId: string,
): Promise<CurrentItemData> => {
  const [itemResult, variantResult] = await Promise.all([
    fetchItem(environmentId, itemId),
    fetchVariant(environmentId, itemId, languageId),
  ]);

  if (itemResult.error || !itemResult.data) {
    throw new Error(itemResult.error ?? "Failed to fetch item");
  }

  if (variantResult.error || !variantResult.data) {
    throw new Error(variantResult.error ?? "Failed to fetch variant");
  }

  const typeResult = await fetchContentType(environmentId, itemResult.data.type.id);

  if (typeResult.error || !typeResult.data) {
    throw new Error(typeResult.error ?? "Failed to fetch content type");
  }

  const elementCodenames = buildElementCodenamesMap(
    typeResult.data.contentType.elements,
    typeResult.data.snippets.map((s) => s.elements),
  );

  const hasSnippet = checkHasSnippet(elementCodenames);

  const isVariant =
    hasSnippet && (await determineIsVariant(variantResult.data, elementCodenames, environmentId));

  return {
    item: itemResult.data,
    variant: variantResult.data,
    contentType: typeResult.data.contentType,
    snippets: typeResult.data.snippets,
    elementCodenames,
    isVariant,
    hasSnippet,
  };
};

export const useCurrentItem = (environmentId: string, itemId: string, languageId: string) => {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.currentItem(environmentId, itemId, languageId),
    queryFn: async () => fetchCurrentItemData(environmentId, itemId, languageId),
  });

  return { data };
};

const determineIsVariant = async (
  variant: LanguageVariantModels.ContentItemLanguageVariant,
  elementCodenames: ReadonlyMap<string, string>,
  environmentId: string,
): Promise<boolean> => {
  const taxonomyResult = await fetchTaxonomy(environmentId, TAXONOMY_CODENAMES.VARIANT_TYPE);

  if (taxonomyResult.data) {
    const variantTermId = findVariantTermId(taxonomyResult.data.terms);
    return checkIsVariant(variant.elements, elementCodenames, variantTermId);
  }
  return false;
};
