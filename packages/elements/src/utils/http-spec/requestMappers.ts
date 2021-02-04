import { IHttpRequest } from '@stoplight/types';
import { Param, Request as HARRequest } from 'har-format';

export function httpRequestToFetchRequest(httpRequest: IHttpRequest<BodyInit>): Parameters<typeof fetch> {
  return [
    httpRequest.url,
    {
      method: httpRequest.method,
      headers: httpRequest.headers,
      body: httpRequest.body,
    },
  ];
}

export function httpRequestToHARRequest(httpRequest: IHttpRequest<BodyInit>): HARRequest {
  let postData: HARRequest['postData'];

  if (httpRequest.body instanceof FormData) {
    const requestBody = httpRequest.body;
    const params: Param[] = [];

    requestBody.forEach((value, name) => {
      if (typeof value === 'string') {
        params.push({
          name,
          value,
        });
      }
    });

    postData = {
      mimeType: 'multipart/form-data',
      params,
    };
  } else if (httpRequest.body instanceof URLSearchParams) {
    const requestBody = httpRequest.body;
    const params: Param[] = [];

    requestBody.forEach((value, name) => {
      if (typeof value === 'string') {
        params.push({
          name,
          value,
        });
      }
    });

    postData = {
      mimeType: 'application/x-www-form-urlencoded',
      params,
    };
  }

  return {
    method: httpRequest.method.toUpperCase(),
    url: httpRequest.url,
    headers: Object.entries(httpRequest.headers).map(([name, value]) => ({ name, value })),
    postData,
    httpVersion: 'HTTP/1.1',
    headersSize: -1,
    bodySize: -1,
    queryString: [],
    cookies: [],
  };
}
