import type { Context } from "@netlify/functions";
import { errorResponse, getManagementClient, jsonResponse, tryCreateNewVersion } from "./shared/management-client.ts";

interface DeleteItemRequest {
  readonly environmentId: string;
  readonly itemId: string;
  readonly languageId: string;
}

const tryCancelScheduledPublishing = async (
  client: ReturnType<typeof getManagementClient>,
  itemId: string,
  languageId: string,
): Promise<void> => {
  await client
    .cancelSheduledPublishingOfLanguageVariant()
    .byItemId(itemId)
    .byLanguageId(languageId)
    .toPromise().catch(() => {});
};

const tryCancelScheduledUnpublishing = async (
  client: ReturnType<typeof getManagementClient>,
  itemId: string,
  languageId: string,
): Promise<void> => {
  await client
    .cancelSheduledUnpublishingOfLanguageVariant()
    .byItemId(itemId)
    .byLanguageId(languageId)
    .toPromise().catch(() => {});
};

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = (await request.json()) as DeleteItemRequest;
    const { environmentId, itemId, languageId } = body;

    if (!environmentId || !itemId || !languageId) {
      return errorResponse("Missing environmentId, itemId, or languageId", 400);
    }

    const client = getManagementClient(environmentId);

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
