import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk';

import instanceConfigFields from './instanceConfigFields';
import validateInvocation from './validateInvocation';

import fetchAccount from './steps/fetch-account';
import fetchUsers from './steps/fetch-users';
import fetchFindings from './steps/fetch-findings';

export const invocationConfig: IntegrationInvocationConfig = {
  instanceConfigFields,
  validateInvocation,
  integrationSteps: [fetchAccount, fetchUsers, fetchFindings],
};
