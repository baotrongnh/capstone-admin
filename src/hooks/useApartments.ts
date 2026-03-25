"use client";

import { apartmentService } from "@/lib/services/apartment.service";
import { useQuery } from "@tanstack/react-query";

export const useApartments = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["apartments", params],
    queryFn: () => apartmentService.getApartments(params),
  });
};
