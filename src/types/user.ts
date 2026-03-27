import { paths } from "./api";

export type UserListResponse =
     paths["/api/v1/users"]["get"]["responses"]["200"]["content"]["application/json"];

export type UserListQuery = NonNullable<
     paths["/api/v1/users"]["get"]["parameters"]["query"]
>;

export type UserListItem = NonNullable<UserListResponse["data"]>[number];

export type UserDetailResponse =
     paths["/api/v1/users/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

export type UserDetail = NonNullable<UserDetailResponse["data"]>;