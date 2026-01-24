import type { Context } from "@netlify/functions";
import { fetchTaxonomyRequestSchema } from "../../shared/schemas/fetch-taxonomy.schema.ts";
import { createManagementClient } from "./shared/management-client.ts";
import { errorResponse, jsonResponse } from "./shared/response-utils.ts";

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  const parseResult = fetchTaxonomyRequestSchema.safeParse(await request.json());
  if (!parseResult.success) {
    return errorResponse(parseResult.error.message, 400);
  }
  const { environmentId } = parseResult.data;
  const codename = parseResult.data.codename;

  try {
    const client = createManagementClient(environmentId);
    const response = await client.getTaxonomy().byTaxonomyCodename(codename).toPromise();

    return jsonResponse(response.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`fetch-taxonomy error for '${codename}':`, message, error);
    return errorResponse(`Failed to fetch taxonomy '${codename}': ${message}`);
  }
};
