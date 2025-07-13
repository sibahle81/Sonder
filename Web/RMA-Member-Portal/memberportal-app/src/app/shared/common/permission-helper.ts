import { Injectable } from "@angular/core";
import { userUtility } from "src/app/shared-utilities/user-utility/user-utility";

@Injectable()
export abstract class PermissionHelper {
  userHasPermission(permissionName: string): boolean {
    return userUtility.hasPermission(permissionName);
  }
}
