import type {
  ContentTypeElements,
  ElementModels,
  LanguageVariantModels,
  TaxonomyModels,
} from "@kontent-ai/management-sdk";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  ELEMENT_SUFFIXES,
  findElementIdByCodenameSuffix,
  TAXONOMY_CODENAMES,
  VARIANT_TYPE_TERMS,
} from "../constants/codenames.ts";
import { queryKeys } from "../constants/queryKeys.ts";
import { fetchContentType, fetchItem, fetchTaxonomy, fetchVariant } from "../services/api.ts";
import type { CurrentItemData } from "../types/variant.types.ts";

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

const findVariantTermId = (terms: ReadonlyArray<TaxonomyModels.Taxonomy>): string | undefined =>
  terms
    .map((term) =>
      term.codename === VARIANT_TYPE_TERMS.VARIANT ? term.id : findVariantTermId(term.terms),
    )
    .find((id) => id !== undefined);

const referenceArraySchema = z.array(z.object({ id: z.string() }));

const checkIfVariant = (
  variantElements: ReadonlyArray<ElementModels.ContentItemElement>,
  elementCodenames: ReadonlyMap<string, string>,
  variantTermId: string | undefined,
): boolean => {
  if (!variantTermId) {
    return false;
  }

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

  const taxonomyValue = referenceArraySchema.safeParse(variantTypeElement.value);
  if (!taxonomyValue.success) {
    return false;
  }

  return taxonomyValue.data.some((term) => term.id === variantTermId);
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
    return checkIfVariant(variant.elements, elementCodenames, variantTermId);
  }
  return false;
};
