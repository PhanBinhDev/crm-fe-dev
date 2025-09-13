type CleanPayload<T> = T extends (infer U)[]
  ? CleanPayload<U>[]
  : T extends Record<string, any>
    ? { [K in keyof T]?: CleanPayload<T[K]> }
    : T;

export function cleanPayload<T>(obj: T): CleanPayload<T> {
  // Loại bỏ undefined và null
  if (obj === undefined || obj === null) {
    return undefined as any;
  }

  // Giữ lại Date objects
  if (obj instanceof Date) {
    return obj as any;
  }

  if (Array.isArray(obj)) {
    return obj
      .map(item => cleanPayload(item))
      .filter(
        v =>
          v !== undefined &&
          v !== null &&
          !(Array.isArray(v) && v.length === 0) &&
          !(
            typeof v === 'object' &&
            v !== null &&
            !(v instanceof Date) &&
            Object.keys(v as Record<string, unknown>).length === 0
          ),
      ) as CleanPayload<T>;
  }

  if (typeof obj === 'object' && obj !== null) {
    const entries = Object.entries(obj as Record<string, unknown>)
      .filter(([_, v]) => {
        if (v === undefined || v === null) return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'object' && v !== null) {
          // Đặc biệt giữ lại các Date object
          if (v instanceof Date) return true;
          return Object.keys(v).length > 0;
        }
        return v !== undefined; // Giữ lại primitive values khác undefined
      })
      .map(([k, v]) => [k, cleanPayload(v)]);

    return Object.fromEntries(entries) as CleanPayload<T>;
  }

  // Giữ lại primitive values (number, string, boolean)
  return obj as CleanPayload<T>;
}
