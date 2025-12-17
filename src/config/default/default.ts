import { DEFAULT_APP_DATA } from './app-data';
import { DEFAULT_META_DATA } from './meta-data';

export const DEFAULT_CONFIG = {
    appName: 'Tradesala',
    fevicon: '/assets/default/favicon.ico',
    ...DEFAULT_APP_DATA,
    ...DEFAULT_META_DATA
};
