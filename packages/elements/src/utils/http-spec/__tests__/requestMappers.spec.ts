import { IHttpRequest } from '@stoplight/types';
import { Request as HARRequest } from 'har-format';

import { httpRequestToFetchRequest, httpRequestToHARRequest } from '../requestMappers';

describe('httpRequestToFetchRequest', () => {
  it('correctly maps request', () => {
    const httpRequest: IHttpRequest<BodyInit> = {
      url: 'https://www.google.com?paramName=paramValue',
      baseUrl: 'https://www.google.com',
      query: {
        paramName: ['paramValue'],
      },
      headers: {
        'Header-Name': 'headerValue',
      },
      method: 'post',
      body: 'some body',
    };

    const expectedFetchRequest: Parameters<typeof fetch> = [
      'https://www.google.com?paramName=paramValue',
      {
        method: 'post',
        headers: {
          'Header-Name': 'headerValue',
        },
        body: 'some body',
      },
    ];

    expect(httpRequestToFetchRequest(httpRequest)).toEqual(expectedFetchRequest);
  });
});

describe('httpRequestToHARRequest', () => {
  it('correctly maps multipart/form-data request', () => {
    const formData = new FormData();
    formData.append('firstParam', 'firstValue');
    formData.append('secondParam', 'secondValue');

    const httpRequest: IHttpRequest<BodyInit> = {
      url: 'https://www.google.com?paramName=paramValue',
      baseUrl: 'https://www.google.com',
      query: {
        paramName: ['paramValue'],
      },
      headers: {
        'Header-Name': 'headerValue',
        'Content-Type': 'multipart/form-data',
      },
      method: 'post',
      body: formData,
    };

    const expectedHARRequest: HARRequest = {
      method: 'POST',
      url: 'https://www.google.com?paramName=paramValue',
      headers: [
        {
          name: 'Header-Name',
          value: 'headerValue',
        },
        {
          name: 'Content-Type',
          value: 'multipart/form-data',
        },
      ],
      postData: {
        mimeType: 'multipart/form-data',
        params: [
          {
            name: 'firstParam',
            value: 'firstValue',
          },
          {
            name: 'secondParam',
            value: 'secondValue',
          },
        ],
      },
      queryString: [],
      httpVersion: 'HTTP/1.1',
      headersSize: -1,
      bodySize: -1,
      cookies: [],
    };

    expect(httpRequestToHARRequest(httpRequest)).toEqual(expectedHARRequest);
  });

  it('correctly maps application/x-www-form-urlencoded request', () => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('firstParam', 'firstValue');
    urlSearchParams.append('secondParam', 'secondValue');

    const httpRequest: IHttpRequest<BodyInit> = {
      url: 'https://www.google.com?paramName=paramValue',
      baseUrl: 'https://www.google.com',
      query: {
        paramName: ['paramValue'],
      },
      headers: {
        'Header-Name': 'headerValue',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'post',
      body: urlSearchParams,
    };

    const expectedHARRequest: HARRequest = {
      method: 'POST',
      url: 'https://www.google.com?paramName=paramValue',
      headers: [
        {
          name: 'Header-Name',
          value: 'headerValue',
        },
        {
          name: 'Content-Type',
          value: 'application/x-www-form-urlencoded',
        },
      ],
      postData: {
        mimeType: 'application/x-www-form-urlencoded',
        params: [
          {
            name: 'firstParam',
            value: 'firstValue',
          },
          {
            name: 'secondParam',
            value: 'secondValue',
          },
        ],
      },
      queryString: [],
      httpVersion: 'HTTP/1.1',
      headersSize: -1,
      bodySize: -1,
      cookies: [],
    };

    expect(httpRequestToHARRequest(httpRequest)).toEqual(expectedHARRequest);
  });
});
