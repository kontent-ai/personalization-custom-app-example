import type {
  ContentItemModels,
  ContentTypeModels,
  ContentTypeSnippetModels,
  LanguageVariantModels,
} from "@kontent-ai/management-sdk";

export interface CurrentItemData {
  readonly item: ContentItemModels.ContentItem;
  readonly variant: LanguageVariantModels.ContentItemLanguageVariant;
  readonly contentType: ContentTypeModels.ContentType;
  readonly snippets: ReadonlyArray<ContentTypeSnippetModels.ContentTypeSnippet>;
  readonly elementCodenames: ReadonlyMap<string, string>;
  readonly isVariant: boolean;
  readonly hasSnippet: boolean;
}

export interface VariantInfo {
  readonly id: string;
  readonly name: string;
  readonly audienceTermId: string | null;
  readonly isBaseContent: boolean;
}
