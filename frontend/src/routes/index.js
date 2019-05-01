import React from 'react';

import Login from './Login';
import Home from './Home';
import Profile from './Profile';
import About from './About';
import Conference from './Conference';
import List from './List';
import Payment from './Payment';
import RegList from './RegList';
import Reg from './Reg';
import Assignment from './Assignment';
import PaymentList from './PaymentList';
import Interview from './Interview';
import AssignmentList from './AssignmentList';
import Admin from './Admin';

import { Route } from '../Router';
import { Switch } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

function filter(node, done) {
  node.addEventListener('transitionend', ev => {
    if(ev.target !== node) return;
    done();
  }, false);
}

function deriveKey(location) {
  if(location.pathname === '/login') return '@login';
  else if(location.pathname === '/register') return '@login';

  return location.key
}

export default ({ location }) => <TransitionGroup>
  <CSSTransition
    key={deriveKey(location)}
    classNames="fade"
    timeout={1000}
    addEndListener={filter}
  >
    <Switch location={location}>
      <Route path="/:action(login|register)" component={Login} exact />
      <Route path="/profile" component={Profile} exact />
      <Route path="/" component={Home} exact />
      <Route path="/about" component={About} exact />
      <Route path="/conference/:id" component={Conference} exact />
      <Route path="/conference" component={List} exact />
      <Route path="/payment/:id" component={Payment} exact />
      <Route path="/conference/:id/admin/reg" component={RegList} exact />
      <Route path="/conference/:id/admin/reg/:user" component={Reg} exact />
      <Route path="/conference/:id/admin/payment" component={PaymentList} exact />
      <Route path="/assignment/:id" component={Assignment} exact />
      <Route path="/conference/:id/admin/assignment" component={AssignmentList} exact />
      <Route path="/interview/:id" component={Interview} exact />
      <Route path="/admin" component={Admin} exact />
    </Switch>
  </CSSTransition>
</TransitionGroup>;
