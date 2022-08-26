import { ActionType } from 'typesafe-actions';
import chooseGroupID from './actions';

export type ChooseGroupIDActionType = ActionType<typeof chooseGroupID>;

export enum ChooseGroupIDEnum {
    CHOOSE_GROUP_ID = '@@groupState/CHOOSE_GROUP_ID',
}

export interface ChooseGroupIDType {
    readonly group_id: string;
    readonly store_id: string;
}
