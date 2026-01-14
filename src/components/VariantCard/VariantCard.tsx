import type { LanguageModels } from "@kontent-ai/management-sdk";
import type { VariantInfo } from "../../types/variant.types.ts";
import { StatusBadge } from "../StatusBadge/StatusBadge.tsx";
import styles from "./VariantCard.module.css";

interface VariantCardProps {
  readonly variant: VariantInfo;
  readonly audienceName: string | null;
  readonly environmentId: string;
  readonly language: LanguageModels.LanguageModel;
  readonly onDelete?: (variantId: string) => void;
}

const buildKontentLink = (environmentId: string, languageId: string, itemId: string): string =>
  `https://app.kontent.ai/${environmentId}/content-inventory/${languageId}/content/${itemId}`;

export const VariantCard = ({
  variant,
  audienceName,
  environmentId,
  language,
  onDelete,
}: VariantCardProps) => {
  const kontentLink = buildKontentLink(environmentId, language.id, variant.id);

  const canDelete = !variant.isBaseContent && onDelete;

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <p className={styles.name}>{variant.name}</p>
        <div className={styles.badges}>
          {variant.isBaseContent ? (
            <StatusBadge variant="base">Base Content</StatusBadge>
          ) : audienceName ? (
            <StatusBadge variant="variant">{audienceName}</StatusBadge>
          ) : (
            <span className={styles.noAudience}>No audience</span>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <a href={kontentLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
          Open
        </a>
        {canDelete && (
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => onDelete(variant.id)}
            aria-label={`Delete ${variant.name}`}
          >
            <svg
              className={styles.deleteIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
