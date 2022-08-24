import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import instanceConfigFields from './instanceConfigFields';
import validateInvocation from './validateInvocation';
import { IntegrationConfig } from './types';

import fetchAccount from './steps/fetch-account';
import fetchUsers from './steps/fetch-users';
import fetchFindings from './steps/fetch-findings';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> =
  {
    instanceConfigFields,
    validateInvocation,
    integrationSteps: [fetchAccount, fetchUsers, fetchFindings],
  };
