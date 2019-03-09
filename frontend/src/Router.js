import { BrowserRouter, Route as ReactRoute } from 'react-router-dom';
import React, { useContext } from 'react';

export const Router = BrowserRouter;

const RouterContext = React.createContext({});

export const Route = ({ component: Comp, ...props }) => (
  <ReactRoute {...props}
    render={ routeProps => (
      <RouterContext.Provider value={routeProps}>
        <Comp {...routeProps} {...props} />
      </RouterContext.Provider>
    )}
  />
);

export const useRouter = () => useContext(RouterContext);
