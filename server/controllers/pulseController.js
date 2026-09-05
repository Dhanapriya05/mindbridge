import { getPulseAggregate } from './triageController.js';
import { memoryStore } from '../config/db.js';

export const getCampusPulse = getPulseAggregate;
export { getPulseAggregate };
export default {
  getCampusPulse,
  getPulseAggregate
};
