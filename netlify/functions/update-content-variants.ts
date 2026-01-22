import type { Context } from "@netlify/functions";
import { updateContentVariantsRequestSchema } from "../../shared/schemas/update-content-variants.schema.ts";
import { updateContentVariantsElement } from "./shared/element-utils.ts";
import { createManagementClient, tryCreateNewVersion } from "./shared/management-client.ts";
import { errorResponse, jsonResponse } from "./shared/response-utils.ts";

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const parseResult = updateContentVariantsRequestSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return errorResponse(parseResult.error.message, 400);
    }
    const {
      environmentId,
      baseItemId,
      languageId,
      contentVariantsElementId,
      variantItemId,
      operation,
    } = parseResult.data;

    const client = createManagementClient(environmentId);

    const currentVariant = await client
      .viewLanguageVariant()
      .byItemId(baseItemId)
      .byLanguageId(languageId)
      .toPromise();

    const updatedElements = updateContentVariantsElement(
      currentVariant.rawData.elements,
      contentVariantsElementId,
      variantItemId,
      operation,
    );

    await tryCreateNewVersion(client, baseItemId, languageId);

    await client
      .upsertLanguageVariant()
      .byItemId(baseItemId)
      .byLanguageId(languageId)
      .withData(() => ({
        elements: updatedElements,
      }))
      .toPromise();

    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message);
  }
};
