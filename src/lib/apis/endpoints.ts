const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "";

export const createEndpoints = (resource: string) => {
  return `${API_PREFIX}/${resource}`;
};

export const endpoints = {
  auth: createEndpoints("auth"),
  apartments: createEndpoints('apartments'),
  user: createEndpoints('users'),
  iot: createEndpoints("iot"),
  chat: createEndpoints("chat"),
  viewRequest: createEndpoints("viewing-requests"),
}
