import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
  Entity,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import {
  convertApp,
  convertFinding,
  getServiceEntity,
  getAccountEntity,
} from '../../converter';
import { IntegrationConfig } from '../../types';

const step: IntegrationStep<IntegrationConfig> = {
  id: 'fetch-findings',
  name: `Fetch NowSecure apps and vulnerability findings`,
  entities: [
    {
      _class: 'Application',
      _type: 'mobile_app',
      resourceName: 'Mobile Applications',
    },
    {
      _class: 'Finding',
      _type: 'nowsecure_finding',
      resourceName: 'Finding',
    },
  ],
  relationships: [
    {
      _type: 'nowsecure_account_has_mobile_app',
      _class: RelationshipClass.HAS,
      sourceType: 'nowsecure_account',
      targetType: 'mobile_app',
    },
    {
      _type: 'nowsecure_service_scans_mobile_app',
      _class: RelationshipClass.SCANS,
      sourceType: 'nowsecure_service',
      targetType: 'mobile_app',
    },
    {
      _type: 'mobile_app_has_nowsecure_finding',
      _class: RelationshipClass.HAS,
      sourceType: 'mobile_app',
      targetType: 'nowsecure_finding',
    },
  ],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const client = createServicesClient(instance);
    const apps = await client.listApplications();

    const appEntities: Entity[] = [];
    for (const app of apps) {
      const appEntity = convertApp(app);
      if (!jobState.hasKey(appEntity._key)) {
        await jobState.addEntity(appEntity);
        appEntities.push(appEntity);
      }
    }

    const accountEntity = getAccountEntity(instance);
    const accountAppRelationships = appEntities.map((appEntity) =>
      createDirectRelationship({
        from: accountEntity,
        to: appEntity,
        _class: RelationshipClass.HAS,
      }),
    );
    await jobState.addRelationships(accountAppRelationships);

    const serviceEntity = getServiceEntity(instance);
    const serviceAppRelationships = appEntities.map((appEntity) =>
      createDirectRelationship({
        from: serviceEntity,
        to: appEntity,
        _class: RelationshipClass.SCANS,
      }),
    );
    await jobState.addRelationships(serviceAppRelationships);

    for (const appEntity of appEntities) {
      if (appEntity.ref) {
        const findings = await client.listAppFindings(appEntity.ref as string);
        const findingEntities = findings.map((f) =>
          convertFinding(f, appEntity.ref as string),
        );

        const seen = new Set<string>();
        const findingEntitiesDeduped: Entity[] = [];
        for (const entity of findingEntities) {
          if (!seen.has(entity._key)) {
            seen.add(entity._key);
            findingEntitiesDeduped.push(entity);
          }
        }
        await jobState.addEntities(findingEntitiesDeduped);

        const relationships = findingEntitiesDeduped.map((findingEntity) =>
          createDirectRelationship({
            from: appEntity,
            to: findingEntity,
            _class: RelationshipClass.HAS,
          }),
        );
        await jobState.addRelationships(relationships);
      }
    }
  },
};

export default step;
