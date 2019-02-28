import React, { useContext } from 'react';
import { withSnackbar, SnackbarProvider } from 'notistack';

const SnackbarContext = React.createContext({});

export const useSnackbar = () => {
  return useContext(SnackbarContext);
};

const Inner = withSnackbar(({
  enqueueSnackbar,
  closeSnackbar,
  children,
}) =>
  <SnackbarContext.Provider value={{
    enqueueSnackbar,
    closeSnackbar,
  }}>
    { children }
  </SnackbarContext.Provider>
);

const Provider = ({
  children,
  ...rest,
}) =>
  <SnackbarProvider {...rest}>
    <Inner>{ children }</Inner>
  </SnackbarProvider>;

export { Provider as SnackbarProvider };
