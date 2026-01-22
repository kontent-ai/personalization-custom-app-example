import { ManagementClient } from "@kontent-ai/management-sdk";

export const createManagementClient = (environmentId: string): ManagementClient => {
  const apiKey = process.env.KONTENT_MANAGEMENT_API_KEY;

  if (!apiKey) {
    throw new Error("KONTENT_MANAGEMENT_API_KEY environment variable is not set");
  }

  return new ManagementClient({
    environmentId,
    apiKey,
  });
};

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
