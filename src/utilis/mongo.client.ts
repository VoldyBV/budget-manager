import * as Realm from 'realm-web';

const REALM_APP_ID = "budget_manager-gbfbt";
export const app: Realm.App = new Realm.App({ id: REALM_APP_ID });
export const credentials = Realm.Credentials.anonymous();
