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

import { VariableSizeList } from 'react-window';

import CardContent from '../overrides/CardContent';

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
  },

  searchIcon: {
    padding: 8,
    marginTop: -8,
    marginLeft: -8,
    marginBottom: -8,
    marginRight: 8,
  },

  statBtn: {
    height: 40,
  },

  searchIconDisabled: {
    color: 'rgba(0,0,0,.3) !important',
  },

  searchSlide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    transition: 'transform .2s ease',
  },

  searchSlideOff: {
    transform: 'translateX(100%) translateX(-24px)',
  },

  searchInput: {
    flex: 1,
  },

  boxConfig: {
    position: 'absolute',
    left: 56,
    right: 56,
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity .2s ease, transform .2s ease',
    transform: 'translateX(-8px)',
    display: 'flex',
    alignItems: 'center',
  },

  boxConfigShown: {
    opacity: 1,
    pointerEvents: 'all',
    transform: 'translateX(0)',
  },

  prefixInput: {
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
    lineHeight: '20px',
  },

  tags: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    display: 'inline-block',
    lineHeight: '20px',
  },

  tagLine: {
    lineHeight: '20px',
    height: 20,
  },

  infoLine: {
    flex: 1,
  },

  boxesWrapper: {
    width: '100vw',
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    top: 327,
    overflowX: 'auto',
  },

  boxes: {
    height: 'calc(100vh - 60px - 327px)',
    maxWidth: 700,
    padding: '0 20px',
    margin: 'auto',
    whiteSpace: 'nowrap',
  },

  boxesOverhang: {
    display: 'inline-block',
    verticalAlign: 'top',
    width: 'calc(50vw - 330px)',
    marginLeft: -theme.spacing.unit,
    height: '100%',
  },

  box: {
    display: 'inline-flex',
    verticalAlign: 'top',
    flexDirection: 'column',
    height: '100%',
    width: 300,
    marginRight: theme.spacing.unit,
  },

  boxHeader: {
    boxShadow: 'rgba(0,0,0,.3) 0 1px 3px',
    zIndex: 1,
    height: 68,
  },

  boxContent: {
    flex: 1,
    overflowY: 'auto'
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
  const [list, setList] = useState(null);

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

  const [mode, setMode] = useState(location.hash ? 'box' : 'list');
  const [prefix, setPrefix] = useState(location.hash ? decodeURIComponent(location.hash.substr(1)) : '');
  const gotoList = useCallback(() => setMode('list'));
  const gotoBox = useCallback(() => setMode('box'));
  const toggleStat = useCallback(() => setMode(mode === 'stat' ? 'box' : 'stat'), [mode]);

  const [moving, setMoving] = useState(null);
  const [currentBox, setCurrentBox] = useState('');
  const openMoveTo = useCallback(target => setMoving(target));
  const closeMoveTo = useCallback(() => setMoving(null));
  const commitMove = useCallback(async box => {
    const tags = moving.tags.filter(e => e.indexOf(`${prefix}:`) !== 0);
    if(box !== null)
      tags.push(`${prefix}:${box}`);

    await dispatch(post(`/conference/${match.params.id}/list/${moving.user._id}/tags`, tags, 'PUT'));
    await updateList();
    closeMoveTo();
  }, [prefix, moving]);

  const [shiftHold, setShiftHold] = useState(false);
  useEffect(() => {
    const press = ev => {
      if(ev.key === 'Shift')
        setShiftHold(true);
    };

    const release = ev => {
      if(ev.key === 'Shift')
        setShiftHold(false);
    };

    window.addEventListener('keydown', press);
    window.addEventListener('keyup', release);
    return () => {
      window.removeEventListener('keydown', press);
      window.removeEventListener('keyup', release);
    };
  });

  const changePrefix = useCallback(debounceEv(ev => {
    setPrefix(ev.target.value);
    window.location.href = `#${ev.target.value}`;
  }, 200));

  const submitTag = useCallback(async () => {
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
      segs.every(s=> {
        if(s[0] === '@') {
          const tag = s.slice(1);

          if(!e.tags)
            return tag[0] === '!';

          if(tag[0] === '!')
            return !e.tags.includes(tag.slice(1));
          else return e.tags.includes(tag); 
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

  const boxes = [];
  const boxContents = {};
  const backlog = [];
  if(list && (mode === 'box' || mode === 'stat') && prefix !== '') {
    // Populate boxes
    for(const user of list) {
      const tag = user.tags.find(tag => tag.indexOf(`${prefix}:`) === 0);
      if(!tag) backlog.push(user);
      else {
        const suffix = tag.substr(prefix.length + 1);
        if(suffix in boxContents) boxContents[suffix].push(user);
        else {
          boxes.push(suffix);
          boxContents[suffix] = [user];
        }
      }
    }
  }

  const renderBox = (box, content) => <Card className={cls.box} key={box}>
    <CardContent className={cls.boxHeader}>
      <Typography variant="h6">{ box || '未分组' }</Typography>
    </CardContent>
    <List disablePadding>
      <VariableSizeList
        height={boxHeight}
        itemCount={content.length + 2}
        itemSize={index => index === 0 || index === content.length + 1 ? 8 : rowHeight }
      >
        { ({ index, style }) => {
          if(index === 0 || index === content.length + 1) return <div />;
          const reg = content[index-1];
          return <div style={style}>
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
                className={cls.infoLine}
                primary={reg.user.realname}
                secondary={generateTagNode(reg.tags, cls)}
                classes={{
                  secondary: cls.tagLine
                }}
              />
              <ListItemSecondaryAction>
                { shiftHold ? 
                    <IconButton onClick={() => {
                      openTagEdit();
                      setEditTarget(reg);
                      setEditInner(reg.tags);
                    }}>
                    <Icon>label</Icon>
                  </IconButton>
                    :
                    <IconButton onClick={() => {
                      openMoveTo(reg);
                      setCurrentBox(box);
                    }}>
                    <Icon>move_to_inbox</Icon>
                  </IconButton>
                }
              </ListItemSecondaryAction>
            </ListItem>
          </div>;
        }}
      </VariableSizeList>
    </List>
  </Card>;

  const statedBoxes = boxes.map(e => ({
    name: e,
    size: boxContents[e].length,
    per: (boxContents[e].length / list.length * 100).toFixed(2) + '%',
  }));

  statedBoxes.sort((a, b) => b.size - a.size);

  const inner = !list ? <Loading /> : <>
    <Card className={cls.search}>
      <IconButton className={cls.searchIcon} disabled={mode === 'box' || mode === 'stat'} onClick={gotoBox} classes={{
        disabled: cls.searchIconDisabled,
      }}>
        <Icon>view_column</Icon>
      </IconButton>

      <div className={clsx(cls.boxConfig, mode !== 'list' ? cls.boxConfigShown: null)}>
        <IconButton
          className={clsx(cls.statBtn, cls.searchIcon)}
          disabled={mode === 'list'}
          onClick={toggleStat}
          color={mode === 'stat' ? 'secondary' : 'default'}
          classes={{
            disabled: cls.searchIconDisabled,
          }}
        >
          <Icon>show_chart</Icon>
        </IconButton>
        <InputBase
          placeholder="标签前缀"
          className={cls.prefixInput}
          onChange={changePrefix}
          defaultValue={location.hash ? decodeURIComponent(location.hash.substr(1)) : ''}
        />
      </div>

      <div className={clsx(cls.searchSlide, mode !== 'list' ? cls.searchSlideOff : null)}>
        <IconButton className={cls.searchIcon} disabled={mode === 'list'} onClick={gotoList} classes={{
          disabled: cls.searchIconDisabled,
        }}>
          <Icon>search</Icon>
        </IconButton>

        <InputBase
          placeholder="标签/姓名/学校 空格分隔"
          className={cls.searchInput}
          onChange={changeSearch}
        />
        <div className={cls.searchCounter}>
          { shownCount } / { list.length }
        </div>
      </div>
    </Card>

    { mode === 'list' ?
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
                  className={cls.infoLine}
                  primary={reg.user.realname}
                  secondary={generateTagNode(reg.tags, cls)}
                  classes={{
                    secondary: cls.tagLine
                  }}
                />
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
        </div> : null }
    { mode === 'box' && prefix !== '' ?
        <div className={cls.boxesWrapper}>
          <div className={cls.boxes}>
            { renderBox(null, backlog) }
            { boxes.map(box => renderBox(box, boxContents[box])) }
            <div className={cls.boxesOverhang} />
          </div>
        </div> : null }
    { mode === 'stat' && prefix !== '' ? 
        <Card>
          <List>
            <ListItem>
              <ListItemIcon>
                <Icon>apps</Icon>
              </ListItemIcon>
              <ListItemText primary={<>总计: <strong>{list.length}</strong></>} secondary={<>分组数: <strong>{boxes.length}</strong></>} />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Icon>bookmark_border</Icon>
              </ListItemIcon>
              <ListItemText primary="未分组" secondary={<><strong>{backlog.length}</strong> / {(backlog.length / list.length * 100).toFixed(2)}%</>} />
            </ListItem>
            { statedBoxes.map(({name, size, per}) => <ListItem key={name}>
              <ListItemIcon>
                <Icon>inbox</Icon>
              </ListItemIcon>
              <ListItemText primary={name} secondary={<><strong>{size}</strong> / {per}</>} />
            </ListItem>) }
          </List>
        </Card> : null }
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

      onSubmit={submitTag}
    />

    <MoveToDialog
      open={moving !== null}
      onClose={closeMoveTo}
      fullWidth

      boxes={boxes}
      current={currentBox}
      onMove={commitMove}
    />
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

export const MoveToDialog = React.memo(({ current, boxes, onMove, ...rest }) => {
  const cls = dialogStyles();

  const [input, setInput] = useState('');
  const changeInput = useCallback(ev => setInput(ev.target.value));
  const checkEnter = useCallback(ev => {
    if(ev.key !== 'Enter') return;
    if(input === '') return;

    onMove(input);
  });

  return <Dialog {...rest}>
    <List>
      { current ?
          <ListItem>
            <ListItemIcon><Icon>inbox</Icon></ListItemIcon>
            <ListItemText primary={current} secondary="从此移动至:" />
          </ListItem> : null }
      <ListItem>
        <ListItemIcon><Icon>add</Icon></ListItemIcon>
        <InputBase
          value={input}
          onChange={changeInput}
          onKeyDown={checkEnter}
          className={cls.input}
        />
      </ListItem>
      { current !== null ?
          <ListItem button onClick={() => onMove(null)}>
            <ListItemIcon><Icon>delete</Icon></ListItemIcon>
            <ListItemText primary='删除分组' />
          </ListItem> : null }
      { boxes.filter(box => box !== current).map((box, index) => <ListItem
        key={box}
        button
        onClick={() => {
          onMove(box)
        }}
      >
        <ListItemIcon><Icon>move_to_inbox</Icon></ListItemIcon>
        <ListItemText primary={box} />
      </ListItem>) }
    </List>
  </Dialog>;
});
