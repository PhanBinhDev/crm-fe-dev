import { CrudOperators, LogicalFilter } from '@refinedev/core';

export const buildFilterCondition = (
  field: string,
  value: any,
  operator: Exclude<CrudOperators, 'or' | 'and'> = 'eq',
): LogicalFilter | null => {
  if (value === null || value === undefined || value === '') return null;
  return { field, operator, value };
};
