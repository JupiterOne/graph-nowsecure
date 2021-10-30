import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from './types';

const instanceConfigFields: IntegrationInstanceConfigFieldMap<IntegrationConfig> =
  {
    apiToken: {
      type: 'string',
      mask: true,
    },
  };

export default instanceConfigFields;
