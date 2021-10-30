import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';

import validateInvocation from '../validateInvocation';
import { IntegrationConfig } from '../types';

import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
  fetchMock.doMock();
});

test('rejects if apiKey is not present', async () => {
  fetchMock.mockResponse('{}');

  const context = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {
      apiToken: undefined as unknown as string,
    },
  });

  await expect(validateInvocation(context)).rejects.toThrow(
    /Provider authentication failed/,
  );
});

test('rejects if unable to hit provider apis', async () => {
  fetchMock.mockResponse(() =>
    Promise.resolve({
      status: 403,
      body: 'Unauthorized',
    }),
  );

  const context = createMockExecutionContext<IntegrationConfig>();
  context.instance.config = {
    apiToken: 'test',
  };

  await expect(validateInvocation(context)).rejects.toThrow(
    /Provider authentication failed/,
  );
});
