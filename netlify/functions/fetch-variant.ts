import type { Context } from "@netlify/functions";
import { errorResponse, getManagementClient, jsonResponse } from "./shared/management-client.ts";

interface FetchVariantRequest {
  readonly environmentId: string;
  readonly itemId: string;
  readonly languageId: string;
}

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = (await request.json()) as FetchVariantRequest;
    const { environmentId, itemId, languageId } = body;

    if (!environmentId || !itemId || !languageId) {
      return errorResponse("Missing environmentId, itemId, or languageId", 400);
    }

    const client = getManagementClient(environmentId);
    const response = await client
      .viewLanguageVariant()
      .byItemId(itemId)
      .byLanguageId(languageId)
      .toPromise();

    return jsonResponse(response.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message);
  }
};
