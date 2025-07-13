import { ActionType } from '../Enums/action-type.enum';

export class ActionParameters {
    constructor(
        public readonly id: number,
        public readonly actionType: ActionType,
        public readonly linkId: number,
        public readonly linkType : string
        ) {
    }
}
