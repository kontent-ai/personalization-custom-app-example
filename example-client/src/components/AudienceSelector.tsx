import { useState, useEffect, useRef, type FC } from "react";
import { useAudience } from "../context/AudienceContext.tsx";
import { AUDIENCES } from "../types/content.ts";
import styles from "./AudienceSelector.module.css";

export const AudienceSelector: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentAudience, setAudience } = useAudience();
  const containerRef = useRef<HTMLDivElement>(null);

  const currentName =
    AUDIENCES.find((a) => a.codename === currentAudience)?.name ?? "Select Audience";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.container} ref={containerRef}>
      {isOpen && (
        <div className={styles.popup}>
          <h3 className={styles.popupTitle}>Preview as Audience</h3>
          <div className={styles.optionsList}>
            {AUDIENCES.map((audience) => (
              <label
                key={audience.codename ?? "none"}
                className={styles.option}
              >
                <input
                  type="radio"
                  name="audience"
                  checked={currentAudience === audience.codename}
                  onChange={() => {
                    setAudience(audience.codename);
                    setIsOpen(false);
                  }}
                  className={styles.radio}
                />
                <span className={styles.optionLabel}>{audience.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        className={styles.button}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className={styles.icon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className={styles.buttonText}>{currentName}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
};
