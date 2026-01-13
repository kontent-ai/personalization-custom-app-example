import { useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { fetchLanguage } from "../services/api";

export const useLanguage = (environmentId: string, languageId: string) => {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.language(environmentId, languageId),
    queryFn: async () => {
      const result = await fetchLanguage(environmentId, languageId);
      if (result.error || !result.data) {
        throw new Error(result.error ?? "Failed to fetch language");
      }
      return result.data;
    },
  });

  return { language: data };
};
