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
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';

import { useDispatch, useMappedState } from 'redux-react-hook';
import { logout } from './store/actions';

import Routes from './routes';
import { NavLink } from 'react-router-dom';

import { SnackbarProvider } from './Snackbar';

import { useRouter } from './Router';

import { gravatar } from './util';
import { BRAND_PRIMARY, BRAND_SECONDARY } from './config';

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
    color: 'rgba(0,0,0,.54)',

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
    width: 250,
  },

  drawerHeader: {
    height: 60,
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
  },

  nowrap: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const App = () => {
  const cls = styles();

  const mapS2P = useCallback(({ token, user, confs })=> ({ login: !!token, user, confs }));
  const { user, login, confs } = useMappedState(mapS2P);

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
        <Typography className={cls.brandFirst} variant="h2">{ BRAND_PRIMARY }</Typography>
        <Typography className={cls.brandSecond} variant="h2">{ BRAND_SECONDARY }</Typography>
      </NavLink>

      <div className={cls.searchRegion}>
        <div className={cls.search}>
          <Icon className={cls.searchIcon}>
            search
          </Icon>
          <InputBase
            className={cls.searchInner}
            placeholder="会议/公告/文件"
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
      <div className={cls.drawerHeader}>
        <NavLink className={cls.brand} to="/" onClick={closeDrawer}>
          <Typography className={cls.brandFirst} variant="h2">{ BRAND_PRIMARY }</Typography>
          <Typography className={cls.brandSecond} variant="h2">{ BRAND_SECONDARY }</Typography>
        </NavLink>
      </div>

      <List className={cls.sidebar}>
        <ListItem button component={NavLink} to="/" onClick={closeDrawer}>
          <ListItemIcon>
            <Icon>dashboard</Icon>
          </ListItemIcon>
          <ListItemText primary="主页" />
        </ListItem>
        <Divider />
        <ListItem button component={NavLink} to="/conference" onClick={closeDrawer}>
          <ListItemIcon>
            <Icon>list_alt</Icon>
          </ListItemIcon>
          <ListItemText primary="所有会议" />
        </ListItem>

        { confs.map(conf =>
          <Tooltip title={conf.title} placement="top">
            <ListItem button component={NavLink} to={`/conference/${conf._id}`} onClick={closeDrawer} key={conf._id}>
              <ListItemIcon>
                <Icon>list_alt</Icon>
              </ListItemIcon>
              <ListItemText primary={conf.title} secondary={conf.abbr} alt={conf.title} className={cls.nowrap} />
            </ListItem>
          </Tooltip>
        ) }

        <Divider />
        <ListItem button component={NavLink} to="/profile" onClick={closeDrawer}>
          <ListItemIcon>
            <Icon>person</Icon>
          </ListItemIcon>
          <ListItemText primary="个人资料" />
        </ListItem>
        <ListItem button component={NavLink} to="/about" onClick={closeDrawer}>
          <ListItemIcon>
            <Icon>feedback</Icon>
          </ListItemIcon>
          <ListItemText primary="关于" />
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
