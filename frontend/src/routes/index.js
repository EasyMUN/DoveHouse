import React from 'react';

import Login from './Login';

import { Route } from 'react-router-dom';

export default () => <>
  <Route path="/login" component={Login} />
</>;
