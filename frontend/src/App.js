import React from 'react';

import { makeStyles } from '@material-ui/styles';

import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';

import Routes from './routes';

const styles = makeStyles(theme => ({
  menu: {
    marginLeft: -12,
    marginRight: 20,
  },

  grow: {
    flex: 1,
  },

  bottom: {
    maxWidth: 740,
    margin: 'auto',
    padding: 20,
  },

  toolbarSpacer: {
    ...theme.mixins.toolbar,
  },
}));

const App = ({ location }) => {
  const cls = styles();

  return <>
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <IconButton className={cls.menu} color="inherit" aria-label="Menu">
          <Icon>menu</Icon>
        </IconButton>

        <Typography variant="h6" color="inherit" className={cls.grow}>
          DoveHouse
        </Typography>
      </Toolbar>
    </AppBar>
    <main className={cls.bottom}>
      <div className={cls.toolbarSpacer} />

      <Routes location={location} />
    </main>
  </>;
};

export default App;
