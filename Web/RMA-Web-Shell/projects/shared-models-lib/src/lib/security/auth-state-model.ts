import { AuthTokenModel } from './auth-tokens-model';
import { ProfileModel } from './profile-model';
import { Permission } from './permission';

export interface AuthStateModel {
    tokens?: AuthTokenModel;
    profile?: ProfileModel;
    authReady?: boolean;
    permissions?: Permission[];
}
