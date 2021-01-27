import { IHttpRequest } from "@stoplight/types";
import { httpRequestToFetchRequest, httpRequestToHARRequest } from "../requestMappers";
import { Request as HARRequest } from 'har-format';

describe('httpRequestToFetchRequest', () => {
    it('correctly maps request', () => {
        const httpRequest: IHttpRequest<BodyInit> = {
            url: 'https://www.google.com?paramName=paramValue',
            baseUrl: 'https://www.google.com',
            query: {
                paramName: ['paramValue']
            },
            headers: {
                'Header-Name': 'headerValue'
            },
            method: 'post',
            body: 'some body'
        };

        const expectedFetchRequest: Parameters<typeof fetch> = [
            'https://www.google.com?paramName=paramValue',
            {
                method: 'post',
                headers: {
                    'Header-Name': 'headerValue'
                },
                body: 'some body'
            }
        ]

        expect(httpRequestToFetchRequest(httpRequest)).toEqual(expectedFetchRequest);
    });
});

describe('httpRequestToHARRequest', () => {
    it('correctly maps application/json request', () => {
        const httpRequest: IHttpRequest<BodyInit> = {
            url: 'https://www.google.com?paramName=paramValue',
            baseUrl: 'https://www.google.com',
            query: {
                paramName: ['paramValue']
            },
            headers: {
                'Header-Name': 'headerValue',
                'Content-Type': 'application/json',
            },
            method: 'post',
            body: '{"a": "b"}'
        };

        const expectedHARRequest: HARRequest = {
            method: 'POST',
            url: 'https://www.google.com?paramName=paramValue',
            headers: [
                {
                    name: 'Header-Name',
                    value: 'headerValue'
                },
                {
                    name: 'Content-Type',
                    value: 'application/json'
                },
            ],
            postData: {
                mimeType: 'application/json',
                text: '{"a": "b"}'
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
