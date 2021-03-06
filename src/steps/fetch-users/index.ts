import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import { convertUser, getAccountEntity } from '../../converter';
import { IntegrationConfig } from '../../types';

const step: IntegrationStep = {
  id: 'fetch-users',
  name: 'Fetch NowSecure account users',
  types: ['nowsecure_account', 'nowsecure_user', 'nowsecure_account_has_user'],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const client = createServicesClient(instance);
    const accountEntity = getAccountEntity(instance);

    const users = await client.listUsers();
    const userEntities = users.map(convertUser);
    await jobState.addEntities(userEntities);

    const relationships = userEntities.map((userEntity) =>
      createIntegrationRelationship({
        from: accountEntity,
        to: userEntity,
        _class: 'HAS',
      }),
    );
    await jobState.addRelationships(relationships);
  },
};

export default step;
