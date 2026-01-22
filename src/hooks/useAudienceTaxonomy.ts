import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { TAXONOMY_CODENAMES } from "../constants/codenames.ts";
import { queryKeys } from "../constants/queryKeys.ts";
import { fetchTaxonomy } from "../services/api.ts";
import { flattenTaxonomyTerms } from "../utils/taxonomy-utils.ts";

export const useAudienceTaxonomy = (environmentId: string) => {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.taxonomy(environmentId, TAXONOMY_CODENAMES.PERSONALIZATION_AUDIENCES),
    queryFn: async () => {
      const result = await fetchTaxonomy(
        environmentId,
        TAXONOMY_CODENAMES.PERSONALIZATION_AUDIENCES,
      );
      if (result.error || !result.data) {
        throw new Error(result.error ?? "Failed to fetch audience taxonomy");
      }
      return result.data;
    },
  });

  const { terms, termMap } = useMemo(() => {
    const flatTerms = flattenTaxonomyTerms(data.terms);
    const map = new Map(flatTerms.map((t) => [t.id, t.name]));
    return { terms: flatTerms, termMap: map };
  }, [data]);

  return { terms, termMap };
};
