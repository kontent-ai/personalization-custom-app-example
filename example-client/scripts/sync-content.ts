import "dotenv/config";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { migrateContentRun } from "@kontent-ai/data-ops";
import JSZip from "jszip";

const __dirname = dirname(fileURLToPath(import.meta.url));

type ContentItem = { readonly system: { readonly codename: string } };
type ContentData = {
  readonly items: ReadonlyArray<ContentItem>;
  readonly assets: ReadonlyArray<unknown>;
};

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
  console.log("Starting content import...\n");

  const environmentId = getEnvVar("VITE_KONTENT_ENVIRONMENT_ID");
  const apiKey = getEnvVar("KONTENT_MANAGEMENT_API_KEY");

  const contentItemsPath = resolve(__dirname, "../kontent-ai-data/contentItems.json");
  const contentData = JSON.parse(readFileSync(contentItemsPath, "utf-8")) as ContentData;

  console.log(`Target environment: ${environmentId}`);
  console.log(`Items to import: ${contentData.items.map((item) => item.system.codename).join(", ")}\n`);

  const zip = new JSZip();
  zip.file("items.json", JSON.stringify(contentData.items));
  zip.file("assets.json", JSON.stringify(contentData.assets));

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  const tempZipPath = resolve(__dirname, "../temp-content.zip");
  writeFileSync(tempZipPath, zipBuffer);

  const relativeZipPath = "temp-content.zip";

  try {
    await migrateContentRun({
      targetEnvironmentId: environmentId,
      targetApiKey: apiKey,
      filename: relativeZipPath,
    });

    console.log("\nContent items imported successfully!");
    console.log("\nYou can now run 'pnpm dev' to start the example application.");
  } finally {
    unlinkSync(tempZipPath);
  }
};

main().catch((error) => {
  console.error("Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
