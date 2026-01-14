import styles from "./StatusMessage.module.css";

type StatusVariant = "success" | "error" | "warning" | "info";

interface StatusMessageProps {
  readonly variant: StatusVariant;
  readonly children: React.ReactNode;
  readonly onDismiss?: () => void;
}

const variantStyles: Record<StatusVariant, string> = {
  success: styles.success,
  error: styles.error,
  warning: styles.warning,
  info: styles.info,
};

export const StatusMessage = ({ variant, children, onDismiss }: StatusMessageProps) => (
  <div className={`${styles.container} ${variantStyles[variant]}`}>
    <span className={styles.message}>{children}</span>
    {onDismiss && (
      <button
        type="button"
        className={styles.dismissButton}
        onClick={onDismiss}
        aria-label="Dismiss message"
      >
        <svg className={styles.dismissIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    )}
  </div>
);
