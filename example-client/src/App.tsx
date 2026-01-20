import type { FC } from "react";
import styles from "./App.module.css";
import { AudienceSelector } from "./components/AudienceSelector.tsx";
import { PersonalizedHero } from "./components/PersonalizedHero.tsx";
import { useLandingPage } from "./hooks/usePersonalizedContent.ts";

export const App: FC = () => {
  const { data: landingPage, isPending, isError, error } = useLandingPage("homepage");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Personalization Example</h1>
        <p className={styles.description}>
          This example demonstrates content personalization based on audience segments. Use the
          audience selector in the bottom-right corner to preview different variants.
        </p>
      </header>

      <main className={styles.main}>
        {isPending && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading content from Kontent.ai...</p>
          </div>
        )}

        {isError && (
          <div className={styles.error}>
            <h2>Error loading content</h2>
            <p>{error?.message ?? "An unknown error occurred"}</p>
            <p className={styles.errorHint}>
              Make sure you have:
              <br />
              1. Copied .env.template to .env and configured the values
              <br />
              2. Run <code>pnpm sync:all</code> to import content to your Kontent.ai environment
            </p>
          </div>
        )}

        {landingPage && (
          <>
            <div className={styles.pageInfo}>
              <span className={styles.pageLabel}>Landing Page:</span>
              <span className={styles.pageTitle}>{landingPage.elements.title.value}</span>
            </div>
            <PersonalizedHero baseItem={landingPage.elements.hero.linkedItems[0]} />
          </>
        )}
      </main>

      <AudienceSelector />
    </div>
  );
};
