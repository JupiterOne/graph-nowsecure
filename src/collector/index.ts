import { IntegrationInstance } from '@jupiterone/integration-sdk-core';
import { ServicesClient } from './ServicesClient';
import { IntegrationConfig } from '../types';

/**
 * Creates a ServicesClient from an integration instance using it's
 * api key.
 */
export function createServicesClient(
  instance: IntegrationInstance<IntegrationConfig>,
): ServicesClient {
  const { apiToken } = instance.config;

  if (!apiToken) {
    throw new Error(
      'Required configuration item "apiToken" is missing on the integration instance config',
    );
  }

  return new ServicesClient({ apiToken });
}
