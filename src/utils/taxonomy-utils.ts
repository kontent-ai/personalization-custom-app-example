import type { TaxonomyModels } from "@kontent-ai/management-sdk";
import { VARIANT_TYPE_TERMS } from "../constants/codenames.ts";

export interface TaxonomyTerm {
  readonly id: string;
  readonly name: string;
  readonly codename: string;
}

export const findVariantTermId = (
  terms: ReadonlyArray<TaxonomyModels.Taxonomy>,
): string | undefined =>
  terms
    .map((term) =>
      term.codename === VARIANT_TYPE_TERMS.VARIANT ? term.id : findVariantTermId(term.terms),
    )
    .find((id) => id !== undefined);

export const flattenTaxonomyTerms = (
  terms: ReadonlyArray<TaxonomyModels.Taxonomy>,
): ReadonlyArray<TaxonomyTerm> =>
  terms.flatMap((term) => [
    { id: term.id, name: term.name, codename: term.codename },
    ...flattenTaxonomyTerms(term.terms),
  ]);
