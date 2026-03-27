import { provincesService } from "@/lib/services/provinces.service";
import { useQuery } from "@tanstack/react-query";

export const useProvinces = () =>
  useQuery({
    queryKey: ["provinces"],
    queryFn: provincesService.getAll,
    staleTime: Infinity,
  });

export const useProvince = (provinceCode: number | undefined) =>
  useQuery({
    queryKey: ["province", provinceCode],
    queryFn: () => provincesService.getProvince(provinceCode!),
    enabled: provinceCode !== undefined,
    staleTime: Infinity,
  });

export const useWards = (provinceCode: number | undefined) =>
  useQuery({
    queryKey: ["wards", provinceCode],
    queryFn: () => provincesService.getWards(provinceCode!),
    enabled: !!provinceCode,
    staleTime: 0,
  });

export const useWard = (wardCode: number | undefined) =>
  useQuery({
    queryKey: ["ward", wardCode],
    queryFn: () => provincesService.getWard(wardCode!),
    enabled: !!wardCode,
    staleTime: 0,
  });

export const useFullAddress = (
  street: string | undefined,
  provinceCode: number | undefined,
  wardCode: number | undefined,
) => {
  const dataWard = useWard(wardCode);
  const dataProvince = useProvince(
    dataWard.data?.province_code ?? provinceCode,
  );
  const ward = dataWard.data?.name;
  const province = dataProvince.data?.name;

  return [street, ward, province].filter(Boolean).join(", ");
};
