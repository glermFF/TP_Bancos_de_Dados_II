import { handle } from '../lib/handle';
import * as communityService from '../services/communityService';

export const detect = handle(() => communityService.detectCommunities());
