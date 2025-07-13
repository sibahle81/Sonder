import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Injectable({
    providedIn: 'root'
  })
  export class FeatureFlagGuard implements CanLoad {
  
    constructor(private router: Router) {}
  
    canLoad(route: Route): boolean {
      const flagName = route.data?.['featureFlag'] as string;
      if (!flagName) {
        return true; // No feature flag, allow load
      }

      function getFeatureName(name: string): string {
        const segments = name.split('_'); // Split the string by underscores
        return segments.pop() || name; // Return the last segment or the original name if not found
      }
  
      // Use the static method from FeatureflagUtility
      const isEnabled = FeatureflagUtility.isFeatureFlagEnabled(flagName);

      const featureName = getFeatureName(flagName);
  
      if (!isEnabled) {
        return true;
      } else { 
        this.router.navigate(['/access-denied', `Access to ${featureName} is currently restricted. Please contact support for more information.`]);
        return false;
      }
    }    
  }