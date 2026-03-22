// import { verifyUser } from "@/hooks/useUser";
// import { apiClient } from "../apis/client";
// import { endpoints } from "../apis/endpoints";

// export type GetUsersResponse = paths.["/api/v1/users"]["get"]["responses"]["200"]["content"]["application/json"];
// export type GetUserByIdResponse = paths["/api/v1/users/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

// export const userService = {
//   getUsers: async (): Promise<GetUsersResponse> => {
//     const { data } = await apiClient.get<GetUsersResponse>(endpoints.users);
//     return data;
//   },
//   getUserById: async (id: string): Promise<GetUserByIdResponse> => {
//     const {data} = await apiClient.get<GetUserByIdResponse>(`${endpoints.users}/${id}`)
//     return data;
//   },
//   verifyUser: async (id: string) => {
//     const {data} = await apiClient.patch(`${endpoints.users}/${id}`)
//     return data;
//   }
// };
