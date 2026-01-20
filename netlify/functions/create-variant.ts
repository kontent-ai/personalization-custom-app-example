import type { ElementContracts } from "@kontent-ai/management-sdk";
import type { Context } from "@netlify/functions";
import {
  type CreateVariantResponse,
  createVariantRequestSchema,
} from "../../shared/schemas/create-variant.schema.ts";
import { updateContentVariantsElement } from "./shared/element-utils.ts";
import { errorResponse, getManagementClient, jsonResponse } from "./shared/management-client.ts";

const buildVariantElements = (
  sourceElements: ReadonlyArray<ElementContracts.IContentItemElementContract>,
  variantTypeElementId: string,
  audienceElementId: string,
  variantTermId: string,
  audienceTermId: string,
): Array<ElementContracts.IContentItemElementContract> =>
  sourceElements.map((element) => {
    if (element.element.id === variantTypeElementId) {
      return {
        ...element,
        value: [{ id: variantTermId }],
      };
    }
    if (element.element.id === audienceElementId) {
      return {
        ...element,
        value: [{ id: audienceTermId }],
      };
    }
    return element;
  });

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const parseResult = createVariantRequestSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return errorResponse(parseResult.error.message, 400);
    }
    const {
      environmentId,
      sourceItemId,
      languageId,
      audienceTermId,
      audienceName,
      variantTermId,
      variantTypeElementId,
      audienceElementId,
      contentVariantsElementId,
    } = parseResult.data;

    const client = getManagementClient(environmentId);

    const sourceItem = await client.viewContentItem().byItemId(sourceItemId).toPromise();

    const sourceVariant = await client
      .viewLanguageVariant()
      .byItemId(sourceItemId)
      .byLanguageId(languageId)
      .toPromise();

    const variantName = `${sourceItem.data.name} (${audienceName})`;

    const newItem = await client
      .addContentItem()
      .withData({
        name: variantName,
        type: { id: sourceItem.data.type.id },
        collection: sourceItem.data.collection ? { id: sourceItem.data.collection.id } : undefined,
      })
      .toPromise();

    const variantElements = buildVariantElements(
      sourceVariant.rawData.elements,
      variantTypeElementId,
      audienceElementId,
      variantTermId,
      audienceTermId,
    );

    const elementsWithSourceLinked = updateContentVariantsElement(
      variantElements,
      contentVariantsElementId,
      sourceItemId,
      "add",
    );

    await client
      .upsertLanguageVariant()
      .byItemId(newItem.data.id)
      .byLanguageId(languageId)
      .withData(() => ({
        elements: elementsWithSourceLinked,
      }))
      .toPromise();

    const response: CreateVariantResponse = {
      itemId: newItem.data.id,
      itemName: newItem.data.name,
    };

    return jsonResponse(response, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message);
  }
};
