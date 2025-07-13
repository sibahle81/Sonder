import { AuthorityLimitConfiguration } from "../authority-limits/authority-limit-configuration";

export class AuthorityLimitResponse {
    userHasAuthorityLimit: boolean;
    reason: string;
    authorityLimitConfigurations: AuthorityLimitConfiguration[];
}