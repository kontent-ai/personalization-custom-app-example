import type { ElementModels } from "@kontent-ai/management-sdk";
import { z } from "zod";
import { ELEMENT_SUFFIXES } from "../constants/codenames.ts";

export const findElementIdByCodenameSuffix = (
  elementCodenames: ReadonlyMap<string, string>,
  suffix: string,
): string | undefined => {
  const entries = Array.from(elementCodenames.entries());
  const found = entries.find(([_, codename]) => codename.endsWith(suffix));
  return found?.[0];
};

type ReferenceArray = ReadonlyArray<{ readonly id: string }>;

export const getReferencesByCodenameSuffix = (
  variantElements: ReadonlyArray<ElementModels.ContentItemElement>,
  elementCodenames: ReadonlyMap<string, string>,
  codenameSuffix: string,
): ReferenceArray | undefined => {
  const elementId = findElementIdByCodenameSuffix(elementCodenames, codenameSuffix);

  if (!elementId) {
    return undefined;
  }

  const element = variantElements.find((el) => el.element.id === elementId);

  if (!element) {
    return undefined;
  }

  const parsed = referenceArraySchema.safeParse(element.value);

  return parsed.success ? parsed.data : undefined;
};

export const checkIsVariant = (
  variantElements: ReadonlyArray<ElementModels.ContentItemElement>,
  elementCodenames: ReadonlyMap<string, string>,
  variantTermId: string | undefined,
): boolean => {
  if (!variantTermId) {
    return false;
  }

  const references = getReferencesByCodenameSuffix(
    variantElements,
    elementCodenames,
    ELEMENT_SUFFIXES.VARIANT_TYPE,
  );

  return references?.some((term) => term.id === variantTermId) ?? false;
};

const referenceArraySchema = z.array(z.object({ id: z.string() }));
