import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import {
  convertApp,
  convertFinding,
  getServiceEntity,
  getAccountEntity,
} from '../../converter';
import { IntegrationConfig } from '../../types';

const step: IntegrationStep = {
  id: 'fetch-findings',
  name: `Fetch NowSecure apps and vulnerability findings`,
  types: [
    'mobile_app',
    'nowsecure_service',
    'nowsecure_finding',
    'nowsecure_account_has_mobile_app',
    'nowsecure_service_tests_mobile_app',
    'mobile_app_has_nowsecure_finding',
  ],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
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

        const seen = new Set<string>();
        const findingEntitiesDeduped = [];
        for (const entity of findingEntities) {
          if (!seen.has(entity._key)) {
            seen.add(entity._key);
            findingEntitiesDeduped.push(entity);
          }
        }
        await jobState.addEntities(findingEntitiesDeduped);

        const relationships = findingEntitiesDeduped.map((findingEntity) =>
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
