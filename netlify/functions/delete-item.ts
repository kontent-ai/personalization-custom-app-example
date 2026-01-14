import type { Context } from "@netlify/functions";
import { errorResponse, getManagementClient, jsonResponse } from "./shared/management-client.ts";

interface DeleteItemRequest {
  readonly environmentId: string;
  readonly itemId: string;
}

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = (await request.json()) as DeleteItemRequest;
    const { environmentId, itemId } = body;

    if (!environmentId || !itemId) {
      return errorResponse("Missing environmentId or itemId", 400);
    }

    const client = getManagementClient(environmentId);

    await client.deleteContentItem().byItemId(itemId).toPromise();

    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message);
  }
};
