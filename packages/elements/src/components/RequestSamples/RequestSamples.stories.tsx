import { Meta, Story } from '@storybook/react';
import { useAtom } from 'jotai';
import * as React from 'react';

import { httpOperation as multipartOperation } from '../../__fixtures__/operations/multipart-formdata-post';
import { httpOperation as urlEncodedOperation } from '../../__fixtures__/operations/urlencoded-post';
import { httpRequestAtom, TryIt } from '../TryIt';
import { RequestSamples, RequestSamplesProps } from './RequestSamples';

export default {
  title: 'Internal/RequestSamples',
  component: RequestSamples,
} as Meta<RequestSamplesProps>;

const Template: Story<RequestSamplesProps> = args => <RequestSamples {...args} />;

export const HoistedStory = Template.bind({});

HoistedStory.args = {
  request: {
    url: 'https://google.com',
    method: 'post',
    bodySize: -1,
    cookies: [],
    headers: [],
    headersSize: -1,
    httpVersion: '1.1',
    queryString: [],
  },
};
HoistedStory.storyName = 'RequestSamples';

const TemplateWithTryIt: Story<any> = args => {
  const [httpRequest] = useAtom(httpRequestAtom);
  return (
    <div>
      <TryIt {...args} />
      {httpRequest && (
        <div className="mt-5">
          <RequestSamples request={httpRequest} />
        </div>
      )}
    </div>
  );
};

export const StoryWithTryItMultipart = TemplateWithTryIt.bind({});

StoryWithTryItMultipart.args = {
  httpOperation: multipartOperation,
};
StoryWithTryItMultipart.storyName = 'with TryIt (multipart)';

export const StoryWithTryItUrlEncoded = TemplateWithTryIt.bind({});

StoryWithTryItUrlEncoded.args = {
  httpOperation: urlEncodedOperation,
};
StoryWithTryItUrlEncoded.storyName = 'with TryIt (urlencoded)';
