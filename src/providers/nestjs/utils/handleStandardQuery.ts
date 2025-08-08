import { CrudFilters, Pagination, CrudSorting } from '@refinedev/core';

// Convert Refine filters to standard query params
export const handleStandardFilters = (filters?: CrudFilters): Record<string, any> => {
  const params: Record<string, any> = {};

  if (!filters) return params;

  filters.forEach(filter => {
    if (
      'field' in filter &&
      filter.value !== undefined &&
      filter.value !== null &&
      filter.value !== ''
    ) {
      const { field, operator, value } = filter;

      switch (field) {
        case 'q':
          // Search query - pass as is
          params.q = value;
          break;

        case 'role':
          // Role filter - handle both single and multiple
          if (Array.isArray(value)) {
            params.role = value;
          } else {
            params.role = value;
          }
          break;

        case 'isActive':
          // Boolean filter
          params.isActive = value;
          break;

        default:
          // Other filters - handle by operator
          switch (operator) {
            case 'eq':
              params[field] = value;
              break;
            case 'contains':
            case 'containss':
              if (field === 'q') {
                params.q = value;
              } else {
                params[field] = value;
              }
              break;
            case 'in':
              params[field] = Array.isArray(value) ? value : [value];
              break;
            case 'gte':
              params[`${field}From`] = value;
              break;
            case 'lte':
              params[`${field}To`] = value;
              break;
            default:
              params[field] = value;
          }
      }
    }
  });

  return params;
};

// Convert Refine pagination to standard query params
export const handleStandardPagination = (pagination?: Pagination): Record<string, any> => {
  const params: Record<string, any> = {};

  if (pagination && pagination.mode === 'server') {
    const { current = 1, pageSize = 10 } = pagination;
    params.page = current;
    params.limit = pageSize;
  }

  return params;
};

// Convert Refine sorters to standard query params
export const handleStandardSorting = (sorters?: CrudSorting): Record<string, any> => {
  const params: Record<string, any> = {};

  if (sorters && sorters.length > 0) {
    const firstSorter = sorters[0];
    params.order = firstSorter.order === 'desc' ? 'DESC' : 'ASC';

    // If backend supports sortBy field
    if (firstSorter.field && firstSorter.field !== 'createdAt') {
      params.sortBy = firstSorter.field;
    }
  }

  return params;
};

// Combine all params
export const buildStandardQuery = (
  filters?: CrudFilters,
  pagination?: Pagination,
  sorters?: CrudSorting,
  meta?: any,
): Record<string, any> => {
  return {
    ...handleStandardFilters(filters),
    ...handleStandardPagination(pagination),
    ...handleStandardSorting(sorters),
    // Add any meta params
    ...(meta?.query || {}),
  };
};
