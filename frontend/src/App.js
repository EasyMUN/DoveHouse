import React, { useCallback } from 'react';

import { makeStyles } from '@material-ui/styles';

import clsx from 'clsx';

import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Avatar from '@material-ui/core/Avatar';

import { useMappedState } from 'redux-react-hook';

import Routes from './routes';

import { SnackbarProvider } from './Snackbar';

const styles = makeStyles(theme => ({
  container: {
    height: '100vh',
    width: '100vw',
    overflow: 'auto',
  },

  nav: {
    position: 'absolute',
    zIndex: 10000,
    width: '100%',

    height: 60,
    display: 'flex',
    alignItems: 'center',

    padding: '0 10px',

    transition: 'opacity .5s ease-out',
  },

  navHidden: {
    opacity: 0,
    transition: 'opacity .2s ease-in',
  },

  brand: {
    margin: '0 10px',
  },

  brandFirst: {
    fontSize: 28,
    fontWeight: 500,
    display: 'inline',
  },

  brandSecond: {
    fontSize: 28,
    fontWeight: 200,
    display: 'inline',
  },

  searchRegion: {
    flex: 1,
    margin: '0 40px',
  },

  search: {
    width: '100%',
    boxSizing: 'border-box',
    margin: '0 auto',

    background: 'rgba(255,255,255, 0.2)',
    height: 40,
    borderRadius: 4,

    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',

    transition: 'background .2s ease, box-shadow .2s ease, color .2s ease',
    color: 'rgba(0,0,0,.38)',

    boxShadow: 'rgba(0,0,0,.12) 0 1px 3px',

    '&:focus-within': {
      background: 'rgba(255,255,255, 1)',
      boxShadow: 'rgba(0,0,0,.3) 0 2px 6px',
      color: 'rgba(0,0,0,.7)',
    },
  },

  searchInner: {
    flex: 1,
    fontSize: 16,
    fontWeight: 400,

    color: 'inherit',

    '& input::placeholder': {
      opacity: 1,
    },
  },

  searchIcon: {
    margin: '0 20px 0 10px',
  },

  avatarBtn: {
    padding: 4,
  },
}));

const App = ({ location }) => {
  const cls = styles();

  const mapS2P = useCallback(({ token })=> ({ login: !!token }));
  const { login } = useMappedState(mapS2P);

  return <div className={cls.container}>
    <nav className={clsx(cls.nav, { [cls.navHidden]: !login })}>
      <IconButton>
        <Icon>
          menu
        </Icon>
      </IconButton>

      <div className={cls.brand}>
        <Typography className={cls.brandFirst} variant="h2">Dove</Typography>
        <Typography className={cls.brandSecond} variant="h2">House</Typography>
      </div>

      <div className={cls.searchRegion}>
        <div className={cls.search}>
          <Icon className={cls.searchIcon}>
            search
          </Icon>
          <InputBase
            className={cls.searchInner}
            placeholder="搜索"
          />
        </div>
      </div>

      <IconButton className={cls.avatarBtn}>
        <Avatar>U</Avatar>
      </IconButton>
    </nav>
    <main className={cls.bottom}>
      <SnackbarProvider>
        <Routes location={location} />
      </SnackbarProvider>
    </main>
  </div>;
};

export default App;
