import React from 'react';

import Login from './Login';

import { Route } from '../Router';

export default () => <>
  <Route path="/:action(login|register)" component={Login} exact />
</>;
