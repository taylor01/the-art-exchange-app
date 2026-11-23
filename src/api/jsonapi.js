// Small helpers for the API's JSON:API documents.

// Index a document's `included` array by "type:id".
export function indexIncluded(included = []) {
  const map = new Map();
  for (const resource of included) map.set(`${resource.type}:${resource.id}`, resource);
  return map;
}

// Resolve one relationship of a resource against the included index.
// To-one returns the resource or null; to-many returns an array.
export function related(resource, name, index) {
  const data = resource?.relationships?.[name]?.data;
  if (Array.isArray(data)) {
    return data.map((ref) => index.get(`${ref.type}:${ref.id}`)).filter(Boolean);
  }
  if (!data) return null;
  return index.get(`${data.type}:${data.id}`) || null;
}

// The id of a to-one relationship, whether or not it was included.
export function relatedId(resource, name) {
  return resource?.relationships?.[name]?.data?.id ?? null;
}
