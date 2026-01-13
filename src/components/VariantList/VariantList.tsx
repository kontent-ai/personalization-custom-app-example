import { LanguageModels } from "@kontent-ai/management-sdk";
import type { VariantInfo } from "../../types/variant.types";
import { VariantCard } from "../VariantCard/VariantCard";
import styles from "./VariantList.module.css";

interface VariantListProps {
  readonly variants: ReadonlyArray<VariantInfo>;
  readonly audienceTermMap: ReadonlyMap<string, string>;
  readonly environmentId: string;
  readonly language: LanguageModels.LanguageModel;
}

const EmptyState = () => (
  <div className={styles.emptyState}>
    <p className={styles.emptyText}>No variants yet</p>
    <p className={styles.emptySubtext}>
      Create a variant to personalize this content for different audiences.
    </p>
  </div>
);

export const VariantList = ({
  variants,
  audienceTermMap,
  environmentId,
  language,
}: VariantListProps) => (
  <div className={styles.container}>
    <div className={styles.header}>
      <h2 className={styles.title}>Other Variants</h2>
      <span className={styles.count}>{variants.length}</span>
    </div>
    {variants.length === 0 ? (
      <EmptyState />
    ) : (
      <div className={styles.list}>
        {variants.map((variant) => (
          <VariantCard
            key={variant.id}
            variant={variant}
            audienceName={
              variant.audienceTermId
                ? audienceTermMap.get(variant.audienceTermId) ?? null
                : null
            }
            environmentId={environmentId}
            language={language}
          />
        ))}
      </div>
    )}
  </div>
);
