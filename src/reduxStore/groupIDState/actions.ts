import { action } from 'typesafe-actions';
import { ChooseGroupIDEnum } from './types';

const chooseGroupID = (data: { group_id: string; store_id: string }) => action(ChooseGroupIDEnum.CHOOSE_GROUP_ID, data);

export default chooseGroupID;
