import React, { useState, useCallback } from 'react';

import { makeStyles } from '@material-ui/styles';

import clsx from 'clsx';

import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import { useDispatch, useMappedState } from 'redux-react-hook';
import { logout } from './store/actions';

import Routes from './routes';
import { NavLink } from 'react-router-dom';

import { SnackbarProvider } from './Snackbar';

import { useRouter } from './Router';

import { gravatar } from './util';

const styles = makeStyles(theme => ({
  container: {
    height: '100vh',
    width: '100vw',
    overflow: 'auto',
  },

  nav: {
    position: 'absolute',
    zIndex: 1000,
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

  sidebar: {
    width: 200,
  },
}));

const App = () => {
  const cls = styles();

  const mapS2P = useCallback(({ token, user })=> ({ login: !!token, user }));
  const { user, login } = useMappedState(mapS2P);

  const { match, history, location } = useRouter();

  const [accountMenu, setAccountMenu] = useState(null);
  const closeAccountMenu = useCallback(() => setAccountMenu(null), [setAccountMenu]);
  const openAccountMenu = useCallback(ev => setAccountMenu(ev.target), [setAccountMenu]);

  const dispatch = useDispatch();
  const logoutCB = useCallback(() => {
    closeAccountMenu();
    setTimeout(() => {
      history.push('/login');
      setTimeout(() => {
        dispatch(logout());
      }, 600);
    });
  }, [dispatch])

  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), [setDrawer]);
  const openDrawer = useCallback(() => setDrawer(true), [setDrawer]);

  const pn = history.location.pathname;

  if(pn !== '/login' && pn !== '/register')
    if(!user && match.path) {
      setTimeout(() => history.replace('/login'));
      return <div />;
    }

  return <div className={cls.container}>
    <nav className={clsx(cls.nav, { [cls.navHidden]: !login })}>
      <IconButton onClick={openDrawer}>
        <Icon>
          menu
        </Icon>
      </IconButton>

      <NavLink className={cls.brand} to="/">
        <Typography className={cls.brandFirst} variant="h2">Dove</Typography>
        <Typography className={cls.brandSecond} variant="h2">House</Typography>
      </NavLink>

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

      <IconButton className={cls.avatarBtn} onClick={openAccountMenu} aria-owns="account-menu">
        <Avatar src={user && gravatar(user.email)}>{ user && user.realname.slice(0, 1) }</Avatar>
      </IconButton>

      <Menu
        id="account-menu"
        anchorEl={accountMenu}
        open={accountMenu !== null}
        onClose={closeAccountMenu}
      >
        <MenuItem onClick={logoutCB}>登出</MenuItem>
      </Menu>
    </nav>

    <Drawer open={drawer} onClose={closeDrawer}>
      <List className={cls.sidebar}>
        <ListItem button>
          <ListItemIcon>
            <Icon>home</Icon>
          </ListItemIcon>
          <ListItemText primary="主页" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <Icon>person</Icon>
          </ListItemIcon>
          <ListItemText primary="个人资料" />
        </ListItem>
      </List>
    </Drawer>

    <main className={cls.bottom}>
      <SnackbarProvider>
        <Routes location={location} />
      </SnackbarProvider>
    </main>
  </div>;
};

export default App;
