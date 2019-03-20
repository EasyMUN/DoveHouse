/* eslint-disable import/first */
import { BRAND_PRIMARY, BRAND_SECONDARY } from './config';
document.title = `${BRAND_PRIMARY}${BRAND_SECONDARY}`;

import * as Sentry from '@sentry/browser';
import { SENTRY } from './config';

if(SENTRY) Sentry.init({ dsn: SENTRY });

import { install } from '@material-ui/styles';
install();
import('./main');
