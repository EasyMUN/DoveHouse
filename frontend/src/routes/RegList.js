import React, { useRef, useEffect, useState, useCallback } from 'react';

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

import { get, post, fetchConf } from '../store/actions';

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

  emptyTags: {
    fontStyle: 'italic',
  },

  tags: {
    whiteSpace: 'no-wrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

function generateTagsNode(tags, cls) {
  if(!tags || tags.length === 0) return <span className={cls.emptyTags}>无标签</span>;
  else if(tags.length < 3) return <span className={cls.tags}>{ tags.join(', ') }</span>;
}

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
  const rowHeight = 60;
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

  const [editing, setEditing] = useState(false);
  const openTagEdit = useCallback(() => setEditing(true));
  const closeTagEdit = useCallback(() => setEditing(false));

  const [editTarget, setEditTarget] = useState(null);
  const [editInner, setEditInner] = useState(null);

  const submitTags = useCallback(async () => {
    await dispatch(post(`/conference/${match.params.id}/list/${editTarget.user._id}/tags`, editInner, 'PUT'));
    await updateList();
    closeTagEdit();
  }, [editInner, editTarget, match]);

  if(!conf) return <BasicLayout>
    <Loading />
  </BasicLayout>;

  function filterList(list) {
    if(search === '') return list;
    const segs = search.split(' ').filter(e => e.length > 0);

    return list.filter(e =>
      segs.some(s=> {
        if(s[0] === '@') {
          const tag = s.slice(1);
          return e.tags.includes(tag);
        } else {
          if(e.user.realname.indexOf(search) !== -1) return true;
          else if(e.user.profile.school.indexOf(search) !== -1) return true;
          else if(e.tags  && e.tags.includes(search)) return true;
          return false;
        }
      })
    );
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
            <ListItemText
              primary={reg.user.realname}
              secondary={generateTagsNode(reg.tags, cls)}/>
            <ListItemSecondaryAction>
              <IconButton onClick={() => {
                openTagEdit();
                setEditTarget(reg);
                setEditInner(reg.tags);
              }}>
                <Icon>label</Icon>
              </IconButton>
            </ListItemSecondaryAction>
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

    <TagEditDialog
      open={editing}
      onClose={closeTagEdit}
      fullWidth

      value={editInner}
      onChange={setEditInner}

      onSubmit={submitTags}
    />
  </BasicLayout>;
});

const dialogStyles = makeStyles(theme => ({
  input: {
    padding: '0 16px',
  },
}));

const TagEditDialog = React.memo(({ value, onChange, onSubmit, ...rest }) => {
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
