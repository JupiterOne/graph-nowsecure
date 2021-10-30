import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import { convertUser, getAccountEntity } from '../../converter';
import { IntegrationConfig } from '../../types';

const step: IntegrationStep<IntegrationConfig> = {
  id: 'fetch-users',
  name: 'Fetch NowSecure account users',
  entities: [
    {
      _class: 'User',
      _type: 'nowsecure_user',
      resourceName: 'User',
    },
  ],
  relationships: [
    {
      _type: 'nowsecure_account_has_user',
      _class: RelationshipClass.HAS,
      sourceType: 'nowsecure_account',
      targetType: 'nowsecure_user',
    },
  ],
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
      createDirectRelationship({
        from: accountEntity,
        to: userEntity,
        _class: RelationshipClass.HAS,
      }),
    );
    await jobState.addRelationships(relationships);
  },
};

export default step;
