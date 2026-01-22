import type { ManagementClient } from "@kontent-ai/management-sdk";
import type { Context } from "@netlify/functions";
import { deleteItemRequestSchema } from "../../shared/schemas/delete-item.schema.ts";
import { createManagementClient, tryCreateNewVersion } from "./shared/management-client.ts";
import { errorResponse, jsonResponse } from "./shared/response-utils.ts";

const tryCancelScheduledPublishing = async (
  client: ManagementClient,
  itemId: string,
  languageId: string,
): Promise<void> => {
  await client
    .cancelSheduledPublishingOfLanguageVariant()
    .byItemId(itemId)
    .byLanguageId(languageId)
    .toPromise()
    .catch(() => {});
};

const tryCancelScheduledUnpublishing = async (
  client: ManagementClient,
  itemId: string,
  languageId: string,
): Promise<void> => {
  await client
    .cancelSheduledUnpublishingOfLanguageVariant()
    .byItemId(itemId)
    .byLanguageId(languageId)
    .toPromise()
    .catch(() => {});
};

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const parseResult = deleteItemRequestSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return errorResponse(parseResult.error.message, 400);
    }
    const { environmentId, itemId, languageId } = parseResult.data;

    const client = createManagementClient(environmentId);

    // These operations may fail silently if not applicable
    await Promise.all([
      tryCancelScheduledPublishing(client, itemId, languageId),
      tryCancelScheduledUnpublishing(client, itemId, languageId),
    ]);

    await tryCreateNewVersion(client, itemId, languageId);

    await client.deleteContentItem().byItemId(itemId).toPromise();

    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message);
  }
};
