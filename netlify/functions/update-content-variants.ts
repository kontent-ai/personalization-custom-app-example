import type { ElementContracts } from "@kontent-ai/management-sdk";
import type { Context } from "@netlify/functions";
import { errorResponse, getManagementClient, jsonResponse, tryCreateNewVersion } from "./shared/management-client.ts";

interface UpdateContentVariantsRequest {
  readonly environmentId: string;
  readonly baseItemId: string;
  readonly languageId: string;
  readonly contentVariantsElementId: string;
  readonly variantItemId: string;
  readonly operation: "add" | "remove";
}

const updateContentVariantsElement = (
  elements: ReadonlyArray<ElementContracts.IContentItemElementContract>,
  contentVariantsElementId: string,
  variantItemId: string,
  operation: "add" | "remove",
): Array<ElementContracts.IContentItemElementContract> =>
  elements.map((element) => {
    if (element.element.id !== contentVariantsElementId) {
      return element;
    }

    const currentValue = Array.isArray(element.value)
      ? (element.value as ReadonlyArray<{ id: string }>)
      : [];

    const newValue =
      operation === "add"
        ? [...currentValue, { id: variantItemId }]
        : currentValue.filter((item) => item.id !== variantItemId);

    return {
      ...element,
      value: newValue,
    };
  });

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = (await request.json()) as UpdateContentVariantsRequest;
    const {
      environmentId,
      baseItemId,
      languageId,
      contentVariantsElementId,
      variantItemId,
      operation,
    } = body;

    if (
      !environmentId ||
      !baseItemId ||
      !languageId ||
      !contentVariantsElementId ||
      !variantItemId ||
      !operation
    ) {
      return errorResponse("Missing required fields", 400);
    }

    if (operation !== "add" && operation !== "remove") {
      return errorResponse("Invalid operation. Must be 'add' or 'remove'", 400);
    }

    const client = getManagementClient(environmentId);

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
