import type { Context } from "@netlify/functions";
import { fetchVariantRequestSchema } from "../../shared/schemas/fetch-variant.schema.ts";
import { createManagementClient } from "./shared/management-client.ts";
import { errorResponse, jsonResponse } from "./shared/response-utils.ts";

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const parseResult = fetchVariantRequestSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return errorResponse(parseResult.error.message, 400);
    }
    const { environmentId, itemId, languageId } = parseResult.data;

    const client = createManagementClient(environmentId);
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
