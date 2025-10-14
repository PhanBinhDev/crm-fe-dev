import { axiosInstance } from '@/lib/axios';
import { DataProvider, HttpError } from '@refinedev/core';
import { AxiosInstance } from 'axios';
import stringify from 'query-string';
import { transformHttpError } from './utils';
import { buildStandardQuery } from './utils/handleStandardQuery';

// interface

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

    return data;
  },

  getMany: async ({ resource, ids, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const queryParams = {
      id: ids,
      ...(meta?.query || {}),
    };

    const queryString = stringify.stringify(queryParams, { arrayFormat: 'comma' });
    const requestUrl = queryString ? `${url}?${queryString}` : url;

    const { data } = await httpClient.get(requestUrl);

    return data;
  },

  create: async ({ resource, variables }) => {
    const url = `${apiUrl}/${resource}`;

    try {
      const { data } = await httpClient.post(url, variables);

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

      return {
        data,
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

    const queryParams = meta?.query || {};

    const queryString = stringify.stringify(queryParams, { arrayFormat: 'comma' });
    const requestUrl = queryString ? `${url}?${queryString}` : url;

    const { data } = await httpClient.get(requestUrl);

    return {
      data: data.data || data,
    };
  },

  deleteOne: async ({ resource, id }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { data } = await httpClient.delete(url);

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

    return Promise.resolve({
      data: data.data || data,
    });
  },
});
