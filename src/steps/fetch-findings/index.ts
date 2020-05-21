import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { createServicesClient } from '../../collector';
import {
  convertApp,
  convertFinding,
  getServiceEntity,
  getAccountEntity,
} from '../../converter';

const step: IntegrationStep = {
  id: 'fetch-findings',
  name: `Fetch NowSecure apps and vulnerability findings`,
  types: ['nowsecure_service', 'nowsecure_finding', 'mobile_app'],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const client = createServicesClient(instance);
    const apps = await client.listApplications();
    const appEntities = apps.map(convertApp);
    await jobState.addEntities(appEntities);

    const accountEntity = getAccountEntity(instance);
    const accountAppRelationships = appEntities.map((appEntity) =>
      createIntegrationRelationship({
        from: accountEntity,
        to: appEntity,
        _class: 'HAS',
      }),
    );
    await jobState.addRelationships(accountAppRelationships);

    const serviceEntity = getServiceEntity(instance);
    const serviceAppRelationships = appEntities.map((appEntity) =>
      createIntegrationRelationship({
        from: serviceEntity,
        to: appEntity,
        _class: 'TESTS',
      }),
    );
    await jobState.addRelationships(serviceAppRelationships);

    for (const appEntity of appEntities) {
      if (appEntity.ref) {
        const findings = await client.listAppFindings(appEntity.ref);
        const findingEntities = findings.map((f) =>
          convertFinding(f, appEntity.ref),
        );
        await jobState.addEntities(findingEntities);

        const relationships = findingEntities.map((findingEntity) =>
          createIntegrationRelationship({
            from: appEntity,
            to: findingEntity,
            _class: 'HAS',
          }),
        );
        await jobState.addRelationships(relationships);
      }
    }
  },
};

export default step;
