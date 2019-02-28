import React from 'react';

import Login from './Login';
import Home from './Home';

import { Route } from '../Router';

export default () => <>
  <Route path="/:action(login|register)" component={Login} exact />
  <Route path="/" component={Home} exact />
</>;
