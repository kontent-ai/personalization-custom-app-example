import type { Context } from "@netlify/functions";
import { errorResponse, getManagementClient, jsonResponse } from "./shared/management-client.ts";

interface FetchContentTypeRequest {
  readonly environmentId: string;
  readonly typeId: string;
}

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = (await request.json()) as FetchContentTypeRequest;
    const { environmentId, typeId } = body;

    if (!environmentId || !typeId) {
      return errorResponse("Missing environmentId or typeId", 400);
    }

    const client = getManagementClient(environmentId);
    const response = await client.viewContentType().byTypeId(typeId).toPromise();

    const snippetIds = response.data.elements
      .filter((element) => element.type === "snippet")
      .map((element) => {
        const snippetElement = element as { snippet?: { id?: string } };
        return snippetElement.snippet?.id;
      })
      .filter((id): id is string => id !== undefined);

    const snippets = await Promise.all(
      snippetIds.map(
        async (snippetId) => await client.viewContentTypeSnippet().byTypeId(snippetId).toPromise(),
      ),
    );

    return jsonResponse({
      contentType: response.data,
      snippets: snippets.map((s) => s.data),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message);
  }
};
