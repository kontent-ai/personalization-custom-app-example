import type { FC } from "react";
import { useAudience } from "../context/AudienceContext.tsx";
import { getVariantAudienceName, resolveVariant } from "../lib/variantResolver.ts";
import type { HeroSection } from "../types/content.ts";
import styles from "./PersonalizedHero.module.css";

interface PersonalizedHeroProps {
  readonly baseItem: HeroSection;
}

export const PersonalizedHero: FC<PersonalizedHeroProps> = ({ baseItem }) => {
  const { currentAudience } = useAudience();
  const resolvedItem = resolveVariant(baseItem, currentAudience);
  const audienceName = getVariantAudienceName(resolvedItem);

  const isVariant =
    resolvedItem.elements.personalization__variant_type.value[0]?.codename === "variant";

  return (
    <section className={styles.hero}>
      <div className={styles.badge} data-variant={isVariant}>
        {audienceName}
      </div>
      <h1 className={styles.headline}>{resolvedItem.elements.headline.value}</h1>
      <p className={styles.subheadline}>{resolvedItem.elements.subheadline.value}</p>
      {resolvedItem.elements.cta_text.value && (
        <a href={resolvedItem.elements.cta_url.value} className={styles.cta}>
          {resolvedItem.elements.cta_text.value}
        </a>
      )}
      <div className={styles.meta}>
        <span className={styles.metaLabel}>Content Item:</span>
        <code className={styles.metaValue}>{resolvedItem.system.codename}</code>
      </div>
    </section>
  );
};
