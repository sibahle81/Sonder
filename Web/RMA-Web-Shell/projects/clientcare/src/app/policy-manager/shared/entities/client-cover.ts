import { ClientCoverOption} from './client-cover-option';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class ClientCover extends BaseClass {
    policyId: number;
    productId: number;
    clientId: number;
    productOptionId: number;
    rateId: number;
    benefitSetId: number;
    numberOfEmployees: number;
    clientCoverOptions: ClientCoverOption[];
}
