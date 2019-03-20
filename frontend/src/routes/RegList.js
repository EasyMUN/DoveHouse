import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';

import { useDispatch } from 'redux-react-hook';

import { makeStyles } from '@material-ui/styles';

import clsx from 'clsx';

import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '../overrides/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';

import { get, post, refresh, fetchConf, fetchComms } from '../store/actions';

import { NavLink } from 'react-router-dom';
import { useRouter } from '../Router';

import Loading from '../comps/Loading';
import UserAvatar from '../comps/UserAvatar';

import BasicLayout from '../layout/Basic';

import { debounceEv } from '../util';

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

    '& .material-icons': {
      marginRight: theme.spacing.unit,
      color: 'rgba(0,0,0,.3)',
    }
  },

  searchInput: {
    flex: 1,
  },

  regSummary: {
    display: 'flex',
    alignItems: 'center',
  },

  regName: {
    marginLeft: 16,
    fontSize: 20,
  },

  actions: {
    padding: 16,
  },

  searchCounter: {
    fontSize: 14,
    lineHeight: '14px',
    color: 'rgba(0,0,0,.38)',
    marginLeft: theme.spacing.unit,
  },
}));

export default React.memo(() => {
  const cls = styles();

  const [conf, setConf] = useState(null);
  const [list, setList] = useState(null);

  const [search, setSearch] = useState('');
  const changeSearch = useCallback(debounceEv(ev => {
    setSearch(ev.target.value);
  }, 200));

  const { match } = useRouter();
  const dispatch = useDispatch();

  const [skipped, setSkipped] = useState(0);
  const [win, setWin] = useState(Infinity);
  const listRef = useRef();
  const rowHeight = 56;
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
    window.addEventListener('resize', virtualize);

    return () => window.removeEventListener('resize', virtualize);
  }, [virtualize]);

  async function updateConf() {
    const conf = await dispatch(fetchConf(match.params.id, true));
    setConf(conf);
  };

  async function updateList() {
    const list = await dispatch(get(`/conference/${match.params.id}/list`));
    setList(list);
    virtualize();
  }

  useEffect(() => {
    updateConf();
    updateList();
  }, [match.params.id, dispatch, virtualize]);

  if(!conf) return <BasicLayout>
    <Loading />
  </BasicLayout>;

  const shown = new Set();
  function filterList(list) {
    if(search === '') return list;
    return list.filter(e => {
      if(search === '') return true;
      else if(e.user.realname.indexOf(search) !== -1) return true;
      else if(e.user.profile.school.indexOf(search) !== -1) return true;
      else if(e.tags  && e.tags.includes(search)) return true;
      return false;
    });
  }

  const filtered = list ? filterList(list) : [];
  const shownCount = filtered.length;

  const sliced = filtered.slice(skipped).slice(0, win);

  const inner = !list ? <Loading /> : <>
    <Card className={cls.search}>
      <Icon>search</Icon>
      <InputBase
        placeholder="标签/姓名/学校 空格分隔"
        className={cls.searchInput}
        onChange={changeSearch}
      />
      <div className={cls.searchCounter}>
        { shownCount } / { list.length }
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
        { sliced.map(reg =>
          <ListItem
            key={reg.user._id}
            button
            component={NavLink}
            to={`/conference/${match.params.id}/admin/reg/${reg.user._id}`}
          >
            <ListItemAvatar>
              <UserAvatar email={reg.user.email} name={reg.user.realname} />
            </ListItemAvatar>
            <ListItemText primary={reg.user.realname} />
          </ListItem>
        )}
      </List>
    </div>
  </>;

  return <BasicLayout onScroll={virtualize}>
    <NavLink className={cls.abbrLine} to={`/conference/${match.params.id}`}>
      <Avatar src={conf.logo} className={cls.logo}/>
      <Typography variant="body2" className={cls.abbr}>{ conf.abbr }</Typography>
    </NavLink>
    <Typography variant="h3" className={cls.pageTitle}>报名名单</Typography>

    <div className={cls.inner}>
      { inner }
    </div>
  </BasicLayout>;
});
