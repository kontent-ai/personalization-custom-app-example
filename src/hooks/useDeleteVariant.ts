import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ELEMENT_SUFFIXES } from "../constants/codenames.ts";
import { queryKeys } from "../constants/queryKeys.ts";
import { deleteItem, updateContentVariants } from "../services/api.ts";
import type { CurrentItemData, VariantInfo, VariantsData } from "../types/variant.types.ts";
import { findElementIdByCodenameSuffix } from "../utils/elementUtils.ts";
import { allVariants } from "../utils/variants.ts";

interface UseDeleteVariantParams {
  readonly environmentId: string;
  readonly languageId: string;
  readonly currentItemData: CurrentItemData;
  readonly currentItemId: string;
  readonly variantsData: VariantsData;
}

interface DeleteVariantInput {
  readonly variantId: string;
}

export const useDeleteVariant = ({
  environmentId,
  languageId,
  currentItemData,
  currentItemId,
  variantsData,
}: UseDeleteVariantParams) => {
  const queryClient = useQueryClient();

  const contentVariantsElementId = findElementIdByCodenameSuffix(
    currentItemData.elementCodenames,
    ELEMENT_SUFFIXES.CONTENT_VARIANTS,
  );

  const mutation = useMutation({
    mutationFn: async ({ variantId }: DeleteVariantInput) => {
      if (!contentVariantsElementId) {
        throw new Error("Content variants element ID not found");
      }

      const allItemsToUpdate = allVariants(variantsData)
        .filter((v) => v.id !== variantId)
        .map((v) => v.id);

      const updateResults = await Promise.all(
        allItemsToUpdate.map(async (itemId) =>
          updateContentVariants({
            environmentId,
            baseItemId: itemId,
            languageId,
            contentVariantsElementId,
            variantItemId: variantId,
            operation: "remove",
          }),
        ),
      );

      const failedUpdate = updateResults.find((r) => r.error);
      if (failedUpdate?.error) {
        throw new Error(failedUpdate.error);
      }

      const deleteResult = await deleteItem(environmentId, variantId, languageId);

      if (deleteResult.error) {
        throw new Error(deleteResult.error);
      }

      return { deletedVariantId: variantId };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<readonly VariantInfo[]>(
        queryKeys.existingVariants(environmentId, currentItemId, languageId),
        (oldOtherVariants) => oldOtherVariants?.filter((v) => v.id !== data.deletedVariantId) ?? [],
      );
    },
  });

  return {
    deleteVariant: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error?.message ?? null,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};
