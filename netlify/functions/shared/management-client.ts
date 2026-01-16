import { ManagementClient } from "@kontent-ai/management-sdk";

export const getManagementClient = (environmentId: string): ManagementClient => {
  const apiKey = process.env.KONTENT_MANAGEMENT_API_KEY;

  if (!apiKey) {
    throw new Error("KONTENT_MANAGEMENT_API_KEY environment variable is not set");
  }

  return new ManagementClient({
    environmentId,
    apiKey,
  });
};

export const jsonResponse = <T>(data: T, status = 200): Response =>
  new Response(JSON.stringify({ data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const errorResponse = (message: string, status = 500): Response =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const tryCreateNewVersion = async (
  client: ManagementClient,
  itemId: string,
  languageId: string,
): Promise<void> => {
  await client
    .createNewVersionOfLanguageVariant()
    .byItemId(itemId)
    .byLanguageId(languageId)
    .toPromise()
    .catch(() => {});
};
