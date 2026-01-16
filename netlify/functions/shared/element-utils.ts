import type { ElementContracts } from "@kontent-ai/management-sdk";

export const updateContentVariantsElement = (
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
