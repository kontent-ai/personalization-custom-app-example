import { useQuery } from "@tanstack/react-query";
import { deliveryClient } from "../lib/kontentClient.ts";
import type { LandingPageType } from "../types/generated/types/landing-page-type.generated.ts";

export const useLandingPage = (codename: string) =>
  useQuery({
    queryKey: ["landingPage", codename],
    queryFn: async () =>
      deliveryClient
        .item<LandingPageType>(codename)
        .depthParameter(3)
        .toPromise()
        .then((response) => response.data.item),
  });
