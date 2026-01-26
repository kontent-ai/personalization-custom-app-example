import "dotenv/config";
import { rm } from "node:fs/promises";
import { generateDeliveryModelsAsync } from "@kontent-ai/model-generator";

const OUTPUT_DIR = "./src/types/generated";

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
  console.log("Generating TypeScript models from a Kontent.ai project...\n");

  const environmentId = getEnvVar("VITE_KONTENT_ENVIRONMENT_ID");
  const managementApiKey = getEnvVar("KONTENT_MANAGEMENT_API_KEY");

  console.log(`Environment: ${environmentId}`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  await rm(OUTPUT_DIR, { recursive: true, force: true });
  console.log("Cleaned output directory.\n");

  await generateDeliveryModelsAsync({
    environmentId,
    managementApiKey,
    outputDir: OUTPUT_DIR,
    addTimestamp: false,
    createFiles: true,
    moduleFileExtension: "ts",
  });

  console.log("\nTypeScript models generated successfully!");
};

await main().catch((error) => {
  console.error("Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
