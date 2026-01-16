import type {
  ContentItemModels,
  ContentTypeModels,
  ContentTypeSnippetModels,
  LanguageModels,
  LanguageVariantModels,
  TaxonomyModels,
} from "@kontent-ai/management-sdk";

interface ApiResponse<T> {
  readonly data?: T;
  readonly error?: string;
}

const callFunction = async <T>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`/.netlify/functions/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      return { error: result.error ?? "Unknown error" };
    }

    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

export const fetchItem = async (
  environmentId: string,
  itemId: string,
): Promise<ApiResponse<ContentItemModels.ContentItem>> =>
  callFunction("fetch-item", { environmentId, itemId });

export const fetchVariant = async (
  environmentId: string,
  itemId: string,
  languageId: string,
): Promise<ApiResponse<LanguageVariantModels.ContentItemLanguageVariant>> =>
  callFunction("fetch-variant", { environmentId, itemId, languageId });

export interface ContentTypeWithSnippets {
  readonly contentType: ContentTypeModels.ContentType;
  readonly snippets: ReadonlyArray<ContentTypeSnippetModels.ContentTypeSnippet>;
}

export const fetchContentType = async (
  environmentId: string,
  typeId: string,
): Promise<ApiResponse<ContentTypeWithSnippets>> =>
  callFunction("fetch-content-type", { environmentId, typeId });

export const fetchTaxonomy = async (
  environmentId: string,
  codename: string,
): Promise<ApiResponse<TaxonomyModels.Taxonomy>> =>
  callFunction("fetch-taxonomy", { environmentId, codename });

export const fetchLanguage = async (
  environmentId: string,
  languageId: string,
): Promise<ApiResponse<LanguageModels.LanguageModel>> =>
  callFunction("fetch-language", { environmentId, languageId });

export interface CreateVariantParams {
  readonly environmentId: string;
  readonly sourceItemId: string;
  readonly languageId: string;
  readonly audienceTermId: string;
  readonly audienceName: string;
  readonly variantTermId: string;
  readonly variantTypeElementId: string;
  readonly audienceElementId: string;
}

export interface CreateVariantResponse {
  readonly itemId: string;
  readonly itemName: string;
}

export const createVariant = async (
  params: CreateVariantParams,
): Promise<ApiResponse<CreateVariantResponse>> => callFunction("create-variant", { ...params });

export interface UpdateContentVariantsParams {
  readonly environmentId: string;
  readonly baseItemId: string;
  readonly languageId: string;
  readonly contentVariantsElementId: string;
  readonly variantItemId: string;
  readonly operation: "add" | "remove";
}

export const updateContentVariants = async (
  params: UpdateContentVariantsParams,
): Promise<ApiResponse<{ success: boolean }>> =>
  callFunction("update-content-variants", { ...params });

export const deleteItem = async (
  environmentId: string,
  itemId: string,
  languageId: string,
): Promise<ApiResponse<{ success: boolean }>> =>
  callFunction("delete-item", { environmentId, itemId, languageId });
