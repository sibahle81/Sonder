import { BrokerageTypeEnum } from './../../../../../shared-models-lib/src/lib/enums/brokerage-type-enum';
export class BrokerageRepresentativeRequest {
  fspNumber: string;
  representativeIdNumbers: string[];
  BrokerageType :BrokerageTypeEnum
}
