import { BaseClass } from '../common/base-class';

export class Role extends BaseClass {
  name: string;
  permissionIds: number[];
  securityRank:number;
}
