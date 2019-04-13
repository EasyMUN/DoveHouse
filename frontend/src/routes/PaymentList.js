import React, { useRef, useEffect, useState, useCallback } from 'react';

import clsx from 'clsx';

import { useDispatch } from 'redux-react-hook';

import { makeStyles } from '@material-ui/styles';

import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import CardContent from '../overrides/CardContent';

import { get, post, fetchConf } from '../store/actions';

import { NavLink } from 'react-router-dom';
import { useRouter } from '../Router';

import Loading from '../comps/Loading';
import UserAvatar from '../comps/UserAvatar';

import BasicLayout from '../layout/Basic';

import { debounceEv } from '../util';

import { calcTotal } from './Payment';

import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';

const styles = makeStyles(theme => ({
  logo: {
    height: 18,
    width: 18,
    marginRight: theme.spacing.unit,
  },

  abbr: {
    marginBottom: 0,
    color: 'rgba(0,0,0,.38)',
  },

  abbrLine: {
    display: 'flex',
    alignItems: 'center',
  },

  pageTitle: {
    marginTop: theme.spacing.unit,
    color: 'rgba(0,0,0,.54)',
  },

  search: {
    marginTop: 40,
    marginBottom: 10,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',

    position: 'sticky',
    top: 64 + 20,
    zIndex: 1,
  },

  searchIcon: {
    marginRight: theme.spacing.unit,
    color: 'rgba(0,0,0,.38)',
  },

  searchInput: {
    flex: 1,
  },

  searchCounter: {
    fontSize: 14,
    lineHeight: '14px',
    color: 'rgba(0,0,0,.38)',
    marginLeft: theme.spacing.unit,
  },

  avatarPaid: {
    background: green[500],
  },

  avatarWaiting: {
    background: blue[500],
  },
}));

function generateTagNode(tags, cls) {
  if(!tags || tags.length === 0) return <span className={cls.emptyTags}>无标签</span>;
  return <span className={cls.tags}>{ tags.join(', ') }</span>;
}

const rowHeight = 60;

export default React.memo(() => {
  const cls = styles();

  const [conf, setConf] = useState(null);
  const [payments, setPayments] = useState(null);

  const [search, setSearch] = useState('');
  const changeSearch = useCallback(debounceEv(ev => {
    setSearch(ev.target.value);
  }, 200));

  const { match, location } = useRouter();
  const dispatch = useDispatch();

  const [boxHeight, setBoxHeight] = useState(window.innerHeight - 327 - 60 - 68);

  const [skipped, setSkipped] = useState(0);
  const [win, setWin] = useState(Math.ceil(window.innerHeight / rowHeight)+1);
  const listRef = useRef();
  const virtualize = useCallback(() => {
    const list = listRef.current;
    if(!list) {
      setSkipped(0);
      setWin(Infinity);
      return;
    }

    const { y } = list.getBoundingClientRect();

    if(y > 0) setSkipped(0);
    else setSkipped(Math.floor((-y) / rowHeight));

    setWin(Math.ceil(window.innerHeight / rowHeight) + 1);
  }, [setSkipped, setWin]);

  useEffect(() => {
    const cb = () => {
      virtualize();
      setBoxHeight(window.innerHeight - 327 - 60 - 68);
    };

    window.addEventListener('resize', cb);
    return () => window.removeEventListener('resize', cb);
  }, [virtualize]);

  async function updateConf() {
    const conf = await dispatch(fetchConf(match.params.id, true));
    setConf(conf);
  };

  async function updatePayments() {
    const payments = await dispatch(get(`/conference/${match.params.id}/payment`));
    setPayments(payments);
    virtualize();
  }

  useEffect(() => {
    updateConf();
    updatePayments();
  }, [match.params.id, dispatch, virtualize]);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuTarget, setMenuTarget] = useState({});

  const openMenu = useCallback((e, item) => {
    setMenuAnchor(e.currentTarget);
    setMenuTarget(item);
  });
  const closeMenu = useCallback(e => setMenuAnchor(null));

  if(!conf) return <BasicLayout>
    <Loading />
  </BasicLayout>;

  function filterList(list) {
    if(search === '') return list;
    const segs = search.split(' ').filter(e => e.length > 0);

    return list.filter(e =>
      segs.every(s=> {
        if(s[0] === '@') {
          if(s[1] === '!') return e.status !== s.slice(2);
          else return e.status === s.slice(1);
        } else {
          if(e.payee.realname.indexOf(s) !== -1) return true;
          if(e.ident === s) return true;
          if(e.desc.indexOf(s) !== -1) return true;
          return false;
        }
      })
    );
  }

  const filtered = filterList(payments || []);
  const sliced = filtered.slice(skipped).slice(0, win);
  const shownCount = filtered.length;

  function generatePaymentAvatar(status) {
    if(status === 'paid') return <Avatar className={cls.avatarPaid}><Icon>done</Icon></Avatar>;
    else if(status === 'closed') return <Avatar><Icon>close</Icon></Avatar>;
    return <Avatar className={cls.avatarWaiting}><Icon>hourglass_empty</Icon></Avatar>;
  }

  async function markStatus(status) {
    if(!menuTarget._id) return;

    await dispatch(post(`/payment/${menuTarget._id}/status`, { status }, 'PUT'));
    await updatePayments();
    closeMenu();
  }

  const inner = !payments ? <Loading /> : <>
    <Card className={cls.search}>
      <Icon className={cls.searchIcon}>search</Icon>

      <InputBase
        placeholder="@状态 + 姓名 / 确认码"
        className={cls.searchInput}
        onChange={changeSearch}
      />
      <div className={cls.searchCounter}>
        { shownCount } / { payments.length }
      </div>
    </Card>

    <div
      ref={listRef}
      style={{
        paddingTop: `${skipped*rowHeight}px`,
        height: `${shownCount*rowHeight}px`,
      }}
    >
      <List>
        { sliced.map(e => <ListItem key={e._id} button component={NavLink} to={`/payment/${e._id}`}>
          <ListItemAvatar>
            { generatePaymentAvatar(e.status) }
          </ListItemAvatar>
          <ListItemText primary={e.desc} secondary={`${calcTotal(e)} -> ${e.payee.realname}`}/>
          <ListItemSecondaryAction>
            <IconButton
              onClick={ev => openMenu(ev, e)}
            >
              <Icon>more_vert</Icon>
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>) }
      </List>
    </div>

    <Menu id="payment-menu" anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
      { menuTarget.status === 'waiting' ?
          <MenuItem onClick={() => markStatus('paid')}>
            <ListItemIcon><Icon>done</Icon></ListItemIcon>
            <ListItemText primary="标记为已支付" />
          </MenuItem> : null }
      { menuTarget.status === 'waiting' ?
          <MenuItem onClick={() => markStatus('closed')}>
            <ListItemIcon><Icon>close</Icon></ListItemIcon>
            <ListItemText primary="关闭" />
          </MenuItem> : null }
      { menuTarget.status === 'closed' ?
          <MenuItem onClick={() => markStatus('waiting')}>
            <ListItemIcon><Icon>hourglass_empty</Icon></ListItemIcon>
            <ListItemText primary="打开" />
          </MenuItem> : null }
      { menuTarget.status === 'paid' ?
          <MenuItem onClick={() => markStatus('waiting')}>
            <ListItemIcon><Icon>hourglass_empty</Icon></ListItemIcon>
            <ListItemText primary="标记为未支付" />
          </MenuItem> : null }
    </Menu>
  </>;

  return <BasicLayout onScroll={virtualize}>
    <NavLink className={cls.abbrLine} to={`/conference/${match.params.id}`}>
      <Avatar src={conf.logo} className={cls.logo}/>
      <Typography variant="body2" className={cls.abbr}>{ conf.abbr }</Typography>
    </NavLink>
    <Typography variant="h3" className={cls.pageTitle}>订单列表</Typography>

    <div className={cls.inner}>
      { inner }
    </div>
  </BasicLayout>;
});

const dialogStyles = makeStyles(theme => ({
  input: {
    padding: '0 16px',
  },
}));

export const TagEditDialog = React.memo(({ value, onChange, onSubmit, ...rest }) => {
  const cls = dialogStyles();

  const tags = value || [];
  const [input, setInput] = useState('');
  const changeInput = useCallback(ev => setInput(ev.target.value));
  const checkEnter = useCallback(ev => {
    if(ev.key !== 'Enter') return;
    if(input === '') return;

    if(tags.includes(input)) return;

    onChange([...tags, input]);
    setInput('');
  });

  return <Dialog {...rest}>
    <List>
      <ListItem>
        <ListItemIcon><Icon>add</Icon></ListItemIcon>
        <InputBase
          value={input}
          onChange={changeInput}
          onKeyDown={checkEnter}
          className={cls.input}
        />
      </ListItem>
      { tags.map((tag, index) => <ListItem key={tag}>
        <ListItemIcon><Icon>label</Icon></ListItemIcon>
        <ListItemText primary={tag} />
        <ListItemSecondaryAction>
          <IconButton onClick={() => {
            const copy = [...tags];
            copy.splice(index, 1);
            onChange(copy);
          }}>
            <Icon>delete</Icon>
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>) }
    </List>
    <DialogActions>
      <Button onClick={onSubmit}>上传</Button>
    </DialogActions>
  </Dialog>;
});
