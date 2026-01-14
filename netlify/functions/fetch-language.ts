import type { Context } from "@netlify/functions";
import { errorResponse, getManagementClient, jsonResponse } from "./shared/management-client.ts";

interface FetchLanguageRequest {
  readonly environmentId: string;
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
    const body = (await request.json()) as FetchLanguageRequest;
    const { environmentId, languageId } = body;

    if (!environmentId || !languageId) {
      return errorResponse("Missing environmentId or languageId", 400);
    }

    const client = getManagementClient(environmentId);
    const response = await client.viewLanguage().byLanguageId(languageId).toPromise();

    return jsonResponse(response.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message);
  }
};
