import React from 'react';

import { makeStyles } from '@material-ui/styles';

import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';

import Routes from './routes';

import { SnackbarProvider } from './Snackbar';

const styles = makeStyles(theme => ({
}));

const App = ({ location }) => {
  const cls = styles();

  return <>
    <main className={cls.bottom}>
      <SnackbarProvider>
        <Routes location={location} />
      </SnackbarProvider>
    </main>
  </>;
};

export default App;
