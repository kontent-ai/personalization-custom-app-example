export const queryKeys = {
  item: (environmentId: string, itemId: string) => ["item", environmentId, itemId] as const,

  variant: (environmentId: string, itemId: string, languageId: string) =>
    ["variant", environmentId, itemId, languageId] as const,

  contentType: (environmentId: string, typeId: string) =>
    ["contentType", environmentId, typeId] as const,

  taxonomy: (environmentId: string, codename: string) =>
    ["taxonomy", environmentId, codename] as const,

  language: (environmentId: string, languageId: string) =>
    ["language", environmentId, languageId] as const,

  currentItem: (environmentId: string, itemId: string, languageId: string) =>
    ["currentItem", environmentId, itemId, languageId] as const,

  existingVariants: (environmentId: string, itemId: string, languageId: string) =>
    ["existingVariants", environmentId, itemId, languageId] as const,
} as const;
