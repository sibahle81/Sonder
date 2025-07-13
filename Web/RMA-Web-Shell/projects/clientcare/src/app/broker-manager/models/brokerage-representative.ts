import { Brokerage } from './brokerage';
import { Representative } from './representative';

export class BrokerageRepresentative {
  id: number;
  brokerageId: number;
  brokerage: Brokerage;
  representativeId: number;
  representative: Representative;
  juristicRepId: number;
  repRole: number;
  startDate: Date;
  endDate: Date;
  createBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  isActive: boolean;
}
