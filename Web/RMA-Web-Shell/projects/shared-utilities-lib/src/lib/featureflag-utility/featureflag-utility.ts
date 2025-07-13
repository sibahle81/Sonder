export class FeatureflagUtility {

  static isFeatureFlagEnabled(key: string): boolean {
    if (sessionStorage.getItem('enabled-feature-flags')) {
      let enabledFeatureFlags: string[];
      enabledFeatureFlags = JSON.parse(sessionStorage.getItem('enabled-feature-flags'));
      return enabledFeatureFlags.includes(key);
    }
  }
}
