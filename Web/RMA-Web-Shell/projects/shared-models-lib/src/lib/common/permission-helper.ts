import { Injectable } from "@angular/core";
import { userUtility } from "projects/shared-utilities-lib/src/lib/user-utility/user-utility";

@Injectable()
export abstract class PermissionHelper {
  userHasPermission(permissionName: string): boolean {
    return userUtility.hasPermission(permissionName);
  }
}
