import { DataProvider, HttpError } from '@refinedev/core';
import { AxiosInstance } from 'axios';
import stringify from 'query-string';
import { axiosInstance } from '@/lib/axios';
import { buildStandardQuery } from './utils/handleStandardQuery';
import { transformHttpError } from './utils';

export const standardDataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance,
): Required<DataProvider> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const queryParams = buildStandardQuery(filters, pagination, sorters, meta);

    const queryString = stringify.stringify(queryParams, { arrayFormat: 'comma' });
    const requestUrl = queryString ? `${url}?${queryString}` : url;

    const response = await httpClient.get(requestUrl);

    const { data } = response;

    if (data.pagination) {
      return {
        data: data.data,
        total: data.pagination.totalRecords,
      };
    } else if (data.data) {
      return {
        data: Array.isArray(data.data) ? data.data : [data.data],
        total: Array.isArray(data.data) ? data.data.length : 1,
      };
    } else {
      return {
        data: Array.isArray(data) ? data : [data],
        total: Array.isArray(data) ? data.length : 1,
      };
    }
  },

  getMany: async ({ resource, ids, meta }) => {
    const url = `${apiUrl}/${resource}`;

    // Use standard query with ids filter
    const queryParams = {
      id: ids, // Backend should handle this as IN operation
      ...(meta?.query || {}),
    };

    // Use query-string to serialize without [] brackets
    const queryString = stringify.stringify(queryParams, { arrayFormat: 'comma' });
    const requestUrl = queryString ? `${url}?${queryString}` : url;

    const { data } = await httpClient.get(requestUrl);

    // Handle backend response structure
    if (data.pagination) {
      return {
        data: data.data,
      };
    } else if (data.data) {
      return {
        data: Array.isArray(data.data) ? data.data : [data.data],
      };
    } else {
      return {
        data: Array.isArray(data) ? data : [data],
      };
    }
  },

  create: async ({ resource, variables }) => {
    const url = `${apiUrl}/${resource}`;

    try {
      const { data } = await httpClient.post(url, variables);

      // Handle backend ResponseDto structure
      return {
        data: data.data || data,
      };
    } catch (error) {
      const httpError = transformHttpError(error);
      throw httpError;
    }
  },

  update: async ({ resource, id, variables }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    try {
      const { data } = await httpClient.patch(url, variables);

      // Handle backend ResponseDto structure
      return {
        data: data.data || data,
      };
    } catch (error) {
      const httpError = transformHttpError(error);
      throw httpError;
    }
  },

  updateMany: async ({ resource, ids, variables }) => {
    const errors: HttpError[] = [];

    const response = await Promise.all(
      ids.map(async id => {
        try {
          const { data } = await httpClient.patch(`${apiUrl}/${resource}/${id}`, variables);
          return data.data || data;
        } catch (error) {
          const httpError = transformHttpError(error);
          errors.push(httpError);
        }
      }),
    );

    if (errors.length > 0) {
      throw errors;
    }

    return { data: response };
  },

  createMany: async ({ resource, variables }) => {
    const url = `${apiUrl}/${resource}/bulk`;

    try {
      const { data } = await httpClient.post(url, { bulk: variables });

      // Handle backend ResponseDto structure
      return {
        data: data.data || data,
      };
    } catch (error) {
      const httpError = transformHttpError(error);
      throw httpError;
    }
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    // Add any meta query params
    const queryParams = meta?.query || {};

    // Use query-string to serialize without [] brackets
    const queryString = stringify.stringify(queryParams, { arrayFormat: 'comma' });
    const requestUrl = queryString ? `${url}?${queryString}` : url;

    const { data } = await httpClient.get(requestUrl);

    // Handle backend ResponseDto structure
    return {
      data: data.data || data,
    };
  },

  deleteOne: async ({ resource, id }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { data } = await httpClient.delete(url);

    // Handle backend ResponseDto structure
    return {
      data: data.data || data,
    };
  },

  deleteMany: async ({ resource, ids }) => {
    const response = await Promise.all(
      ids.map(async id => {
        const { data } = await httpClient.delete(`${apiUrl}/${resource}/${id}`);
        return data.data || data;
      }),
    );
    return { data: response };
  },

  getApiUrl: () => {
    return apiUrl;
  },

  custom: async ({ url, method, meta, filters, sorters, payload, query, headers }) => {
    // Build standard query params
    const standardParams = buildStandardQuery(filters, undefined, sorters, meta);

    let requestUrl = url;
    const allParams = {
      ...standardParams,
      ...query,
    };

    if (Object.keys(allParams).length > 0) {
      requestUrl = `${url}?${stringify.stringify(allParams)}`;
    }

    let axiosConfig: any = {};
    if (headers) {
      axiosConfig.headers = headers;
    }

    let axiosResponse;
    switch (method) {
      case 'put':
      case 'post':
      case 'patch':
        axiosResponse = await httpClient[method](url, payload, axiosConfig);
        break;
      case 'delete':
        axiosResponse = await httpClient.delete(url, {
          ...axiosConfig,
          data: payload,
        });
        break;
      default:
        axiosResponse = await httpClient.get(requestUrl, axiosConfig);
        break;
    }

    const { data } = axiosResponse;

    // Handle backend ResponseDto structure for custom requests
    return Promise.resolve({
      data: data.data || data,
    });
  },
});
