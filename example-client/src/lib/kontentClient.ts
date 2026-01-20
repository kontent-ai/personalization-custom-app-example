import { DeliveryClient } from "@kontent-ai/delivery-sdk";

const environmentId = import.meta.env.VITE_KONTENT_ENVIRONMENT_ID;
const previewApiKey = import.meta.env.VITE_KONTENT_PREVIEW_API_KEY;

const missingVars: string[] = [];
if (!environmentId) {
  missingVars.push("VITE_KONTENT_ENVIRONMENT_ID");
}
if (!previewApiKey) {
  missingVars.push("VITE_KONTENT_PREVIEW_API_KEY");
}

if (missingVars.length > 0) {
  throw new Error(
    `Missing environment variables: ${missingVars.join(", ")}. ` +
      "Please copy .env.template to .env and configure the values.",
  );
}

export const deliveryClient = new DeliveryClient({
  environmentId,
  previewApiKey,
  defaultQueryConfig: {
    usePreviewMode: true,
  },
});
