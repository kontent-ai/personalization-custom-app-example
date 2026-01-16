import { Suspense, useMemo, useState } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useAudienceTaxonomy } from "../../hooks/useAudienceTaxonomy.ts";
import { useCreateVariant } from "../../hooks/useCreateVariant.ts";
import { useCurrentItem } from "../../hooks/useCurrentItem.ts";
import { useDeleteVariant } from "../../hooks/useDeleteVariant.ts";
import { useExistingVariants } from "../../hooks/useExistingVariants.ts";
import { useLanguage } from "../../hooks/useLanguage.ts";
import { useVariantTermId } from "../../hooks/useVariantTermId.ts";
import type { VariantInfo } from "../../types/variant.types.ts";
import { AudienceSelector } from "../AudienceSelector/AudienceSelector.tsx";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal/ConfirmDeleteModal.tsx";
import { StatusBadge } from "../StatusBadge/StatusBadge.tsx";
import { StatusMessage } from "../StatusMessage/StatusMessage.tsx";
import { VariantList } from "../VariantList/VariantList.tsx";
import styles from "./PersonalizationPanel.module.css";

interface PersonalizationPanelProps {
  readonly environmentId: string;
  readonly itemId: string;
  readonly languageId: string;
}

const LoadingState = () => (
  <div className={styles.loadingContainer}>
    <div className={styles.spinner} />
    <span className={styles.loadingText}>Loading item data...</span>
  </div>
);

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div className={styles.errorContainer}>
    <svg className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <div className={styles.errorContent}>
      <p className={styles.errorTitle}>Error loading item</p>
      <p className={styles.errorMessage}>
        {error instanceof Error ? error.message : "An unknown error occurred"}
      </p>
      <button type="button" className={styles.retryButton} onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  </div>
);

const NoSnippetState = () => (
  <div className={styles.infoContainer}>
    <p className={styles.infoText}>
      This content type does not have the personalization snippet attached. The snippet should
      include variant_type, personalization_audience, and content_variants elements.
    </p>
  </div>
);

interface PersonalizationPanelContentProps {
  readonly environmentId: string;
  readonly itemId: string;
  readonly languageId: string;
}

const PersonalizationPanelContent = ({
  environmentId,
  itemId,
  languageId,
}: PersonalizationPanelContentProps) => {
  const [variantToDelete, setVariantToDelete] = useState<VariantInfo | null>(null);

  const { data } = useCurrentItem(environmentId, itemId, languageId);
  const { terms: audienceTerms, termMap: audienceTermMap } = useAudienceTaxonomy(environmentId);
  const { variants } = useExistingVariants(environmentId, languageId, itemId, data);
  const { language } = useLanguage(environmentId, languageId);
  const { variantTermId } = useVariantTermId(environmentId);

  const isBaseContent = !data.isVariant;

  const actualBaseItemId = useMemo(() => {
    if (isBaseContent) {
      return itemId;
    }
    const baseItem = variants.find((v) => v.isBaseContent);
    return baseItem?.id ?? itemId;
  }, [isBaseContent, itemId, variants]);

  const {
    createVariant,
    isCreating,
    error: createError,
    isSuccess: createSuccess,
    reset: resetCreate,
  } = useCreateVariant({
    environmentId,
    languageId,
    currentItemData: data,
    variantTermId,
    baseItemId: actualBaseItemId,
    currentItemId: itemId,
    existingVariants: variants,
  });

  const {
    deleteVariant,
    isDeleting,
    error: deleteError,
    isSuccess: deleteSuccess,
    reset: resetDelete,
  } = useDeleteVariant({
    environmentId,
    languageId,
    currentItemData: data,
    baseItemId: actualBaseItemId,
    currentItemId: itemId,
    existingVariants: variants,
  });

  const usedAudienceIds = useMemo(
    () =>
      new Set(
        variants
          .filter((v) => !v.isBaseContent && v.audienceTermId)
          .map((v) => v.audienceTermId as string),
      ),
    [variants],
  );

  const handleCreateVariant = (audienceId: string, audienceName: string) => {
    resetCreate();
    resetDelete();
    createVariant({ audienceTermId: audienceId, audienceName });
  };

  const handleDeleteClick = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    if (variant) {
      setVariantToDelete(variant);
    }
  };

  const handleDeleteConfirm = () => {
    if (variantToDelete) {
      resetCreate();
      resetDelete();
      deleteVariant(
        { variantId: variantToDelete.id },
        {
          onSuccess: () => {
            setVariantToDelete(null);
          },
        },
      );
    }
  };

  const handleDeleteCancel = () => {
    setVariantToDelete(null);
  };

  if (!data.hasSnippet) {
    return <NoSnippetState />;
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Personalization</h1>
      </div>

      {createSuccess && (
        <StatusMessage variant="success" onDismiss={resetCreate}>
          Variant created successfully!
        </StatusMessage>
      )}

      {deleteSuccess && (
        <StatusMessage variant="success" onDismiss={resetDelete}>
          Variant deleted successfully!
        </StatusMessage>
      )}

      {createError && (
        <StatusMessage variant="error" onDismiss={resetCreate}>
          {createError}
        </StatusMessage>
      )}

      {deleteError && (
        <StatusMessage variant="error" onDismiss={resetDelete}>
          {deleteError}
        </StatusMessage>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Current Item</span>
          <StatusBadge variant={data.isVariant ? "variant" : "base"}>
            {data.isVariant ? "Variant" : "Base Content"}
          </StatusBadge>
        </div>
        <p className={styles.itemName}>{data.item.name}</p>
        <p className={styles.itemType}>Type: {data.contentType.name}</p>
      </div>

      <VariantList
        variants={variants}
        audienceTermMap={audienceTermMap}
        environmentId={environmentId}
        language={language}
        onDeleteVariant={handleDeleteClick}
        currentItemId={itemId}
      />

      <AudienceSelector
        audiences={audienceTerms}
        usedAudienceIds={usedAudienceIds}
        onCreateVariant={handleCreateVariant}
        isCreating={isCreating}
      />

      {variantToDelete && (
        <ConfirmDeleteModal
          variantName={variantToDelete.name}
          audienceName={
            variantToDelete.audienceTermId
              ? (audienceTermMap.get(variantToDelete.audienceTermId) ?? null)
              : null
          }
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export const PersonalizationPanel = ({
  environmentId,
  itemId,
  languageId,
}: PersonalizationPanelProps) => (
  <div className={styles.container}>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingState />}>
        <PersonalizationPanelContent
          environmentId={environmentId}
          itemId={itemId}
          languageId={languageId}
        />
      </Suspense>
    </ErrorBoundary>
  </div>
);
