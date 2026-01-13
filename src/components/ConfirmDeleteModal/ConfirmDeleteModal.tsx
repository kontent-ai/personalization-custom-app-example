import styles from "./ConfirmDeleteModal.module.css";

interface ConfirmDeleteModalProps {
  readonly variantName: string;
  readonly audienceName: string | null;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly isDeleting: boolean;
}

export const ConfirmDeleteModal = ({
  variantName,
  audienceName,
  onConfirm,
  onCancel,
  isDeleting,
}: ConfirmDeleteModalProps) => (
  <div className={styles.overlay}>
    <div className={styles.modal}>
      <div className={styles.header}>
        <h2 className={styles.title}>Delete Variant</h2>
      </div>
      <div className={styles.content}>
        <p className={styles.message}>
          Are you sure you want to delete this variant?
        </p>
        <div className={styles.variantInfo}>
          <p className={styles.variantName}>{variantName}</p>
          {audienceName && (
            <p className={styles.audienceName}>Audience: {audienceName}</p>
          )}
        </div>
        <p className={styles.warning}>This action cannot be undone.</p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <span className={styles.spinner} />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </div>
  </div>
);
