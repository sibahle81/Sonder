import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { PipeTransform, Pipe } from '@angular/core';
@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {
  
  transform(item: any, replace, replacement, isRegex?: boolean): any {

    const isFeatureFlag: boolean = FeatureflagUtility.isFeatureFlagEnabled('ReplaceTextRegex');
    
    if (item == null) { return ''; }

    if(!isFeatureFlag) {
        item = item.replace(replace, replacement);
    } else {
      if (isRegex) {
        let regex = new RegExp(replace, 'g');
        item = item.replace(regex, replacement);
      } else {
        item = item.replace(replace, replacement);
      }
    }

    return item;
  }
}
