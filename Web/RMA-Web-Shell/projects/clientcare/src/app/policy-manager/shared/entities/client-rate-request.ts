import { CategoryInsuredEnum } from '../enums/categoryInsuredEnum';

export class ClientRateRequest {
  rolePlayerId: number;
  productOptionId: number;
  categoryInsured: CategoryInsuredEnum;
  ratingYear: number;
}

