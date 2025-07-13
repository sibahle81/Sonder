// wiki: http://bit.ly/2B31K3B
// The lookup data based on type to return start and end along with the value.

/** @description he lookup data based on type to return start and end along with the value. */
export class LookupValue {
  lookupValueId: number;
  lookupTypeId: number;
  startDate: string;
  endDate: string;
  value: number | null;
}