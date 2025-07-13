import { UserTypeEnum } from "../enums/user-type-enum";
import { PagedRequest } from "../pagination/PagedRequest";

export class UserSearchRequest {
    roleIds: number[];
    permissions: string[];
    userType: UserTypeEnum;
    pagedRequest: PagedRequest;
}
