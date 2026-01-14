import type { Context } from "@netlify/functions";
import { errorResponse, getManagementClient, jsonResponse } from "./shared/management-client.ts";

interface FetchTaxonomyRequest {
  readonly environmentId: string;
  readonly codename: string;
}

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  let codename = "unknown";

  try {
    const body = (await request.json()) as FetchTaxonomyRequest;
    const { environmentId } = body;
    codename = body.codename;

    if (!environmentId || !codename) {
      return errorResponse("Missing environmentId or codename", 400);
    }

    const client = getManagementClient(environmentId);
    const response = await client.getTaxonomy().byTaxonomyCodename(codename).toPromise();

    return jsonResponse(response.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`fetch-taxonomy error for '${codename}':`, message, error);
    return errorResponse(`Failed to fetch taxonomy '${codename}': ${message}`);
  }
};
