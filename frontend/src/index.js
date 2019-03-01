/* eslint-disable import/first */
import { BRAND_PRIMARY, BRAND_SECONDARY } from './config';
document.title = `${BRAND_PRIMARY}${BRAND_SECONDARY}`;

import { install } from '@material-ui/styles';
install();
import('./main');
