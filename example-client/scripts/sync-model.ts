import "dotenv/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type SyncEntities, syncRun } from "@kontent-ai/data-ops";

const __dirname = dirname(fileURLToPath(import.meta.url));

const TAXONOMY_CODENAMES = ["variant_type", "personalization_audiences"] as const;
const CONTENT_TYPE_CODENAMES = ["hero_section", "landing_page"] as const;
const SNIPPET_CODENAMES = ["personalization"] as const;

const getEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    console.error("\nPlease copy .env.template to .env and configure the values.");
    process.exit(1);
  }
  return value;
};

const main = async (): Promise<void> => {
  console.log("Starting content model sync...\n");

  const environmentId = getEnvVar("VITE_KONTENT_ENVIRONMENT_ID");
  const apiKey = getEnvVar("KONTENT_MANAGEMENT_API_KEY");
  const folderName = resolve(__dirname, "../kontent-ai-data");

  console.log(`Source folder: ${folderName}`);
  console.log(`Target environment: ${environmentId}\n`);

  const entities: SyncEntities = {
    taxonomies: (taxonomy) =>
      TAXONOMY_CODENAMES.includes(taxonomy.codename as (typeof TAXONOMY_CODENAMES)[number]),
    contentTypeSnippets: (snippet) =>
      SNIPPET_CODENAMES.includes(snippet.codename as (typeof SNIPPET_CODENAMES)[number]),
    contentTypes: (contentType) =>
      CONTENT_TYPE_CODENAMES.includes(
        contentType.codename as (typeof CONTENT_TYPE_CODENAMES)[number],
      ),
  };

  console.log("Syncing snippets:");
  SNIPPET_CODENAMES.forEach((name) => {
    console.log(`  - ${name}`);
  });
  console.log("Syncing taxonomies:");
  TAXONOMY_CODENAMES.forEach((name) => {
    console.log(`  - ${name}`);
  });
  console.log("Syncing content types:");
  CONTENT_TYPE_CODENAMES.forEach((name) => {
    console.log(`  - ${name}`);
  });
  console.log("");

  await syncRun({
    targetEnvironmentId: environmentId,
    targetApiKey: apiKey,
    folderName,
    entities,
  });

  console.log("\nContent model sync complete!");
  console.log("\nNext step: Run 'pnpm sync:content' to import sample content items.");
};

await main().catch((error) => {
  console.error("Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
