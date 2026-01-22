import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { TAXONOMY_CODENAMES } from "../constants/codenames.ts";
import { queryKeys } from "../constants/queryKeys.ts";
import { fetchTaxonomy } from "../services/api.ts";
import { findVariantTermId } from "../utils/taxonomy-utils.ts";

export const useVariantTermId = (environmentId: string) => {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.taxonomy(environmentId, TAXONOMY_CODENAMES.VARIANT_TYPE),
    queryFn: async () => {
      const result = await fetchTaxonomy(environmentId, TAXONOMY_CODENAMES.VARIANT_TYPE);
      if (result.error || !result.data) {
        throw new Error(result.error ?? "Failed to fetch variant type taxonomy");
      }
      return result.data;
    },
  });

  const variantTermId = useMemo(() => findVariantTermId(data.terms), [data.terms]);

  if (!variantTermId) {
    throw new Error("Variant term not found in taxonomy");
  }

  return { variantTermId };
};
