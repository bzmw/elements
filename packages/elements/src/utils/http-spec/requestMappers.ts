import { IHttpRequest } from '@stoplight/types';
import { Request as HARRequest } from 'har-format';

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

  let postData = {
    mimeType: 'application/json',
    text: httpRequest.body as string,
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
