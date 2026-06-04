import { DEFAULT_CONFIG } from "src/config/default/default";

export const environment = {
  production: false,
  staging: true,
  //baseUrl: 'http://api.tradesala.local',
  //mediaUrl: 'http://admin.tradesala.local',
  //frontEndUrl: 'https://tradesala.com',
  baseUrl: 'https://uat-api.tradesala.com',
  mediaUrl: 'https://uat-admin.tradesala.com',
  frontEndUrl: 'https://uat.tradesala.com',
  appName: 'Tradesala',
  config: DEFAULT_CONFIG,
  GA_TRACKING_ID: '',
  GA_TAGMANGER_ID: ''
};
