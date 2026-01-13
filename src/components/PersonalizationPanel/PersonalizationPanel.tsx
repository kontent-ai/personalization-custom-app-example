import { Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useAudienceTaxonomy } from "../../hooks/useAudienceTaxonomy";
import { useCurrentItem } from "../../hooks/useCurrentItem";
import { useExistingVariants } from "../../hooks/useExistingVariants";
import { useLanguage } from "../../hooks/useLanguage";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import { VariantList } from "../VariantList/VariantList";
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
    <svg
      className={styles.errorIcon}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
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
      <button
        type="button"
        className={styles.retryButton}
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  </div>
);

const NoSnippetState = () => (
  <div className={styles.infoContainer}>
    <p className={styles.infoText}>
      This content type does not have the personalization snippet attached.
      The snippet should include variant_type, personalization_audience, and
      content_variants elements.
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
  const { data } = useCurrentItem(environmentId, itemId, languageId);
  const { termMap: audienceTermMap } = useAudienceTaxonomy(environmentId);
  const { variants } = useExistingVariants(
    environmentId,
    languageId,
    itemId,
    data
  );
  const { language } = useLanguage(environmentId, languageId);

  if (!data.hasSnippet) {
    return <NoSnippetState />;
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Personalization</h1>
      </div>
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
      />
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
