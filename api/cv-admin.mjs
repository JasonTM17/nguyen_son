import { productionHandlers } from '../server/cv/handlers.mjs';
export default (req, res) => productionHandlers().admin(req, res);
