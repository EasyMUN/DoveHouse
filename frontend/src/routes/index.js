import React from 'react';

import Login from './Login';
import Home from './Home';
import Profile from './Profile';

import { Route } from '../Router';
import { Switch } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

function filter(node, done) {
  node.addEventListener('transitionend', ev => {
    if(ev.target !== node) return;
    done();
  }, false);
}

export default ({ location }) => <TransitionGroup>
  <CSSTransition
    key={location.key}
    classNames="fade"
    timeout={1000}
    addEndListener={filter}
  >
    <Switch location={location}>
      <Route path="/:action(login|register)" component={Login} exact />
      <Route path="/profile" component={Profile} exact />
      <Route path="/" component={Home} exact />
    </Switch>
  </CSSTransition>
</TransitionGroup>;
