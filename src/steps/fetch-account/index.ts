import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { getAccountEntity, getServiceEntity } from '../../converter';

const step: IntegrationStep = {
  id: 'fetch-account',
  name: 'Fetch NowSecure account and service',
  types: ['nowsecure_account', 'nowsecure_service'],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const accountEntity = getAccountEntity(instance);
    await jobState.addEntity(accountEntity);

    const serviceEntity = getServiceEntity(instance);
    await jobState.addEntity(serviceEntity);

    const accountServiceRelationship = createIntegrationRelationship({
      from: accountEntity,
      to: serviceEntity,
      _class: 'PROVIDES',
    });
    await jobState.addRelationship(accountServiceRelationship);
  },
};

export default step;
