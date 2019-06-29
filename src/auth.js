import OktaAuth from '@splunk/cloud-auth/OktaAuth';
import { auth as authConfig } from './config.json';

export default new OktaAuth({
    ...authConfig,
    redirectUri: process.env.REDIRECT || 'https://mattwelchsdcproject.herokuapp.com',
});