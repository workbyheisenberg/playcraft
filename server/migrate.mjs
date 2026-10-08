import {database,migrate} from './db.mjs';const db=database();migrate(db);db.close();
