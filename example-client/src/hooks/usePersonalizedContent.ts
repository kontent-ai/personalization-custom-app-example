import { useQuery } from "@tanstack/react-query";
import { deliveryClient } from "../lib/kontentClient.ts";
import type { LandingPage } from "../types/content.ts";

export const useLandingPage = (codename: string) =>
  useQuery({
    queryKey: ["landingPage", codename],
    queryFn: async () =>
      deliveryClient
        .item<LandingPage>(codename)
        .depthParameter(3)
        .toPromise()
        .then((response) => response.data.item),
  });
