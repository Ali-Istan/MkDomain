import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Domain {
  id: string;
  domain: string;
  isActive: boolean;
  status: "pending" | "verified" | "rejected";
  createdDate: number;
}

export const domainApi = createApi({
  reducerPath: "domainApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://6797aa2bc2c861de0c6d964c.mockapi.io/domain",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Domain"],
  endpoints: (builder) => ({
    getDomains: builder.query<Domain[], void>({
      query: () => "",
      providesTags: ["Domain"],
    }),
    getDomain: builder.query<Domain, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Domain", id }],
    }),
    addDomain: builder.mutation<Domain, Partial<Domain>>({
      query: (body) => ({
        url: "",
        method: "POST",
        body: {
          ...body,
          createdDate: Math.floor(Date.now() / 1000),
        },
      }),
      invalidatesTags: ["Domain"],
    }),
    updateDomain: builder.mutation<
      Domain,
      { id: string; body: Partial<Domain> }
    >({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Domain", id: arg.id },
      ],
    }),
    deleteDomain: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
        responseHandler: (response) => response.text(),
      }),
      invalidatesTags: ["Domain"],
    }),
  }),
});

export const {
  useGetDomainsQuery,
  useGetDomainQuery,
  useAddDomainMutation,
  useUpdateDomainMutation,
  useDeleteDomainMutation,
} = domainApi;
