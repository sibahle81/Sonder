export interface ProfileModel {
  sub: string;

  email: string;
  name: string;
  token: string;
  username: string;
  userTypeId: number;
  roleId: number;
  role: string;
  preferences: string;
  token_usage: string;
  jti: string;
  at_hash: string;
  nbf: number;
  exp: number;
  iat: number;
  iss: string;
  isinternaluser: string;
  portalTypeId: number;
}
