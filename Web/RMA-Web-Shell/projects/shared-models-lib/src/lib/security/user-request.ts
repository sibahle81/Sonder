
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

export class UserRequest extends BaseClass {
	user: User;
	oldPassword: string;
}