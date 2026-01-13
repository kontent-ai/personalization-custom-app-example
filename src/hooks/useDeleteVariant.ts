import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ELEMENT_SUFFIXES, findElementIdByCodenameSuffix } from "../constants/codenames";
import { queryKeys } from "../constants/queryKeys";
import { deleteItem, updateContentVariants } from "../services/api";
import type { CurrentItemData, VariantInfo } from "../types/variant.types";

interface UseDeleteVariantParams {
  readonly environmentId: string;
  readonly languageId: string;
  readonly currentItemData: CurrentItemData;
  readonly baseItemId: string;
  readonly existingVariants: ReadonlyArray<VariantInfo>;
}

interface DeleteVariantInput {
  readonly variantId: string;
}

export const useDeleteVariant = ({
  environmentId,
  languageId,
  currentItemData,
  baseItemId,
  existingVariants,
}: UseDeleteVariantParams) => {
  const queryClient = useQueryClient();

  const contentVariantsElementId = findElementIdByCodenameSuffix(
    currentItemData.elementCodenames,
    ELEMENT_SUFFIXES.CONTENT_VARIANTS
  );

  const mutation = useMutation({
    mutationFn: async ({ variantId }: DeleteVariantInput) => {
      if (!contentVariantsElementId) {
        throw new Error("Content variants element ID not found");
      }

      const allItemsToUpdate = [
        baseItemId,
        ...existingVariants.filter((v) => v.id !== variantId).map((v) => v.id),
      ];

      const updateResults = await Promise.all(
        allItemsToUpdate.map(async (itemId) =>
          updateContentVariants({
            environmentId,
            baseItemId: itemId,
            languageId,
            contentVariantsElementId,
            variantItemId: variantId,
            operation: "remove",
          })
        )
      );

      const failedUpdate = updateResults.find((r) => r.error);
      if (failedUpdate?.error) {
        throw new Error(failedUpdate.error);
      }

      const deleteResult = await deleteItem(environmentId, variantId);

      if (deleteResult.error) {
        throw new Error(deleteResult.error);
      }

      return { deletedVariantId: variantId };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ReadonlyArray<VariantInfo>>(
        queryKeys.existingVariants(environmentId, baseItemId, languageId),
        (oldVariants) =>
          oldVariants?.filter((v) => v.id !== data.deletedVariantId) ?? []
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
