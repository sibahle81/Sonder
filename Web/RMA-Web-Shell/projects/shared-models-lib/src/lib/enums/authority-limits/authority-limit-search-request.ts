import { PagedRequest } from "../../pagination/PagedRequest";
import { AuthorityLimitItemTypeEnum } from "./authority-limit-item-type-enum";

export class AuthorityLimitSearchRequest {
    authorityLimitItemType: AuthorityLimitItemTypeEnum;
    pagedRequest: PagedRequest;
}
