import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { getAccountEntity, getServiceEntity } from '../../converter';
import { IntegrationConfig } from '../../types';

const step: IntegrationStep<IntegrationConfig> = {
  id: 'fetch-account',
  name: 'Fetch NowSecure account and service',
  entities: [
    {
      _class: 'Account',
      _type: 'nowsecure_account',
      resourceName: 'Account',
    },
    {
      _class: 'Service',
      _type: 'nowsecure_service',
      resourceName: 'Service',
    },
  ],
  relationships: [
    {
      _type: 'nowsecure_account_provides_service',
      _class: RelationshipClass.PROVIDES,
      sourceType: 'nowsecure_account',
      targetType: 'nowsecure_service',
    },
  ],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const accountEntity = getAccountEntity(instance);
    await jobState.addEntity(accountEntity);

    const serviceEntity = getServiceEntity(instance);
    await jobState.addEntity(serviceEntity);

    const accountServiceRelationship = createDirectRelationship({
      from: accountEntity,
      to: serviceEntity,
      _class: RelationshipClass.PROVIDES,
    });

    await jobState.addRelationship(accountServiceRelationship);
  },
};

export default step;
