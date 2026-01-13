import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { TaxonomyModels } from "@kontent-ai/management-sdk";
import { TAXONOMY_CODENAMES } from "../constants/codenames";
import { queryKeys } from "../constants/queryKeys";
import { fetchTaxonomy } from "../services/api";

interface AudienceTerm {
  readonly id: string;
  readonly name: string;
  readonly codename: string;
}

const flattenTerms = (
  terms: ReadonlyArray<TaxonomyModels.Taxonomy>
): ReadonlyArray<AudienceTerm> =>
  terms.flatMap((term) => [
    { id: term.id, name: term.name, codename: term.codename },
    ...flattenTerms(term.terms),
  ]);

export const useAudienceTaxonomy = (environmentId: string) => {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.taxonomy(environmentId, TAXONOMY_CODENAMES.PERSONALIZATION_AUDIENCES),
    queryFn: async () => {
      const result = await fetchTaxonomy(
        environmentId,
        TAXONOMY_CODENAMES.PERSONALIZATION_AUDIENCES
      );
      if (result.error || !result.data) {
        throw new Error(result.error ?? "Failed to fetch audience taxonomy");
      }
      return result.data;
    },
  });

  const { terms, termMap } = useMemo(() => {
    const flatTerms = flattenTerms(data.terms);
    const map = new Map(flatTerms.map((t) => [t.id, t.name]));
    return { terms: flatTerms, termMap: map };
  }, [data]);

  return { terms, termMap };
};
