// wiki: http://bit.ly/2B31K3B
// The lookup data.

/** @description The lookup data. */
export class Lookup {
  id: number;
  name: string;
  category: string;
  code: string;
  isChecked: boolean;
  skillSubCategoryId: number;
  universalBranchCode: string;

constructor(id?: number, name?: string) {
  this.id = id;
  this.name = name;
 }
}

