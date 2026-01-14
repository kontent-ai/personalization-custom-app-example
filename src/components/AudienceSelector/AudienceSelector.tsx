import { useState } from "react";
import styles from "./AudienceSelector.module.css";

interface AudienceTerm {
  readonly id: string;
  readonly name: string;
}

interface AudienceSelectorProps {
  readonly audiences: ReadonlyArray<AudienceTerm>;
  readonly usedAudienceIds: ReadonlySet<string>;
  readonly onCreateVariant: (audienceId: string, audienceName: string) => void;
  readonly isCreating: boolean;
  readonly disabled?: boolean;
}

export const AudienceSelector = ({
  audiences,
  usedAudienceIds,
  onCreateVariant,
  isCreating,
  disabled = false,
}: AudienceSelectorProps) => {
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>("");

  const availableAudiences = audiences.filter((audience) => !usedAudienceIds.has(audience.id));

  const handleCreate = () => {
    const selectedAudience = audiences.find((a) => a.id === selectedAudienceId);
    if (!selectedAudience) {
      return;
    }
    onCreateVariant(selectedAudience.id, selectedAudience.name);
    setSelectedAudienceId("");
  };

  const isDisabled = disabled || isCreating || availableAudiences.length === 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Create Variant</h3>
      </div>
      <div className={styles.controls}>
        <select
          className={styles.select}
          value={selectedAudienceId}
          onChange={(e) => setSelectedAudienceId(e.target.value)}
          disabled={isDisabled}
        >
          <option value="">
            {availableAudiences.length === 0 ? "All audiences used" : "Select audience..."}
          </option>
          {availableAudiences.map((audience) => (
            <option key={audience.id} value={audience.id}>
              {audience.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.createButton}
          onClick={handleCreate}
          disabled={isDisabled || !selectedAudienceId}
        >
          {isCreating ? (
            <>
              <span className={styles.spinner} />
              Creating...
            </>
          ) : (
            "Create"
          )}
        </button>
      </div>
      {availableAudiences.length === 0 && audiences.length > 0 && (
        <p className={styles.hint}>All available audiences have been used for variants.</p>
      )}
    </div>
  );
};
