import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ELEMENT_SUFFIXES, findElementIdByCodenameSuffix } from "../constants/codenames.ts";
import { queryKeys } from "../constants/queryKeys.ts";
import { createVariant, updateContentVariants } from "../services/api.ts";
import type { CurrentItemData, VariantInfo } from "../types/variant.types.ts";

interface UseCreateVariantParams {
  readonly environmentId: string;
  readonly languageId: string;
  readonly currentItemData: CurrentItemData;
  readonly variantTermId: string;
  readonly baseItemId: string;
  readonly currentItemId: string;
  readonly existingVariants: ReadonlyArray<VariantInfo>;
}

interface CreateVariantInput {
  readonly audienceTermId: string;
  readonly audienceName: string;
}

export const useCreateVariant = ({
  environmentId,
  languageId,
  currentItemData,
  variantTermId,
  baseItemId,
  currentItemId,
  existingVariants,
}: UseCreateVariantParams) => {
  const queryClient = useQueryClient();

  const variantTypeElementId = findElementIdByCodenameSuffix(
    currentItemData.elementCodenames,
    ELEMENT_SUFFIXES.VARIANT_TYPE,
  );

  const audienceElementId = findElementIdByCodenameSuffix(
    currentItemData.elementCodenames,
    ELEMENT_SUFFIXES.PERSONALIZATION_AUDIENCE,
  );

  const contentVariantsElementId = findElementIdByCodenameSuffix(
    currentItemData.elementCodenames,
    ELEMENT_SUFFIXES.CONTENT_VARIANTS,
  );

  const mutation = useMutation({
    mutationFn: async ({ audienceTermId, audienceName }: CreateVariantInput) => {
      if (!variantTypeElementId || !audienceElementId || !contentVariantsElementId) {
        throw new Error("Required element IDs not found in content type");
      }

      const createResult = await createVariant({
        environmentId,
        sourceItemId: baseItemId,
        languageId,
        audienceTermId,
        audienceName,
        variantTermId,
        variantTypeElementId,
        audienceElementId,
        contentVariantsElementId,
      });

      if (createResult.error || !createResult.data) {
        throw new Error(createResult.error ?? "Failed to create variant");
      }

      const newVariantId = createResult.data.itemId;

      const allItemsToUpdate = [
        baseItemId,
        ...existingVariants.map((v) => v.id),
        ...(currentItemId !== baseItemId ? [currentItemId] : []),
      ];

      const updateResults = await Promise.all(
        allItemsToUpdate.map(async (itemId) =>
          updateContentVariants({
            environmentId,
            baseItemId: itemId,
            languageId,
            contentVariantsElementId,
            variantItemId: newVariantId,
            operation: "add",
          }),
        ),
      );

      const failedUpdate = updateResults.find((r) => r.error);
      if (failedUpdate?.error) {
        throw new Error(failedUpdate.error);
      }

      return createResult.data;
    },
    onSuccess: (data, variables) => {
      const newVariant: VariantInfo = {
        id: data.itemId,
        name: data.itemName,
        audienceTermId: variables.audienceTermId,
        isBaseContent: false,
      };

      queryClient.setQueryData<ReadonlyArray<VariantInfo>>(
        queryKeys.existingVariants(environmentId, currentItemId, languageId),
        (oldVariants) => (oldVariants ? [...oldVariants, newVariant] : [newVariant]),
      );
    },
  });

  return {
    createVariant: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error?.message ?? null,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};
