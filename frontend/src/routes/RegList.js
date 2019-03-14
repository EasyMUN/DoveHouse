import React, { useMemo, useEffect, useState, useCallback } from 'react';

import { useDispatch } from 'redux-react-hook';

import { makeStyles } from '@material-ui/styles';

import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';

import { get, post, refresh, fetchConf, fetchComms } from '../store/actions';

import { NavLink } from 'react-router-dom';
import { useRouter } from '../Router';

import Loading from '../comps/Loading';
import UserAvatar from '../comps/UserAvatar';

import BasicLayout from '../layout/Basic';

import { RegDetailDialog } from './Conference';

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
}));

export default React.memo(() => {
  const cls = styles();

  const [conf, setConf] = useState(null);
  const [comms, setComms] = useState(null);
  const [list, setList] = useState(null);

  const [regDetailOpen, setRegDetailOpen] = useState(false);
  const [regViewing, setRegViewing] = useState(null);
  const closeRegDetail = useCallback(() => setRegDetailOpen(false), [setRegDetailOpen]);

  const [search, setSearch] = useState('');
  const changeSearch = useCallback(ev => setSearch(ev.target.value));

  const { match } = useRouter();
  const dispatch = useDispatch();

  async function updateConf() {
    const conf = await dispatch(fetchConf(match.params.id, true));
    setConf(conf);
  };

  async function updateComms() {
    const conf = await dispatch(fetchComms(match.params.id, true));
    setComms(conf);
  };

  async function updateList() {
    const list = await dispatch(get(`/conference/${match.params.id}/list`));
    setList(list);
  }

  useEffect(() => {
    updateConf();
    updateComms();
    updateList();
  }, [match.params.id, dispatch]);

  if(!conf) return <BasicLayout>
    <Loading />
  </BasicLayout>;

  function filterList(list) {
    if(search === '') return list;
    return list.filter(e => {
      if(e.user.realname.indexOf(search) !== -1) return true;
      else if(e.user.profile.school.indexOf(search) !== -1) return true;
      else if(e.tags  && e.tags.includes(search)) return true;
      return false;
    });
  }

  const inner = !list ? <Loading /> : <>
    <Card className={cls.search}>
      <Icon>search</Icon>
      <InputBase
        placeholder="标签/姓名/学校 空格分隔"
        className={cls.searchInput}
        value={search}
        onChange={changeSearch}
      />
    </Card>

    { filterList(list).map(reg =>
      <ExpansionPanel key={reg.user._id}>
        <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
          <div className={cls.regSummary}>
            <UserAvatar email={reg.user.email} name={reg.user.realname} />
            <Typography className={cls.regName}>{ reg.user.realname }</Typography>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <List>
            <ListItem>
              <ListItemIcon><Icon>email</Icon></ListItemIcon>
              <ListItemText primary={reg.user.email} />
            </ListItem>
            <ListItem>
              <ListItemIcon><Icon>phone</Icon></ListItemIcon>
              <ListItemText primary={reg.user.profile.phone} />
            </ListItem>
            <ListItem>
              <ListItemIcon><Icon>school</Icon></ListItemIcon>
              <ListItemText primary={reg.user.profile.school} />
            </ListItem>
          </List>
        </ExpansionPanelDetails>
        <ExpansionPanelActions className={cls.actions}>
          <Button onClick={() => {
            setRegDetailOpen(true);
            setRegViewing(reg.reg);
          }}>志愿详情</Button>
        </ExpansionPanelActions>
      </ExpansionPanel>
    ) }
  </>;

  return <BasicLayout>
    <NavLink className={cls.abbrLine} to={`/conference/${match.params.id}`}>
      <Avatar src={conf.logo} className={cls.logo}/>
      <Typography variant="body2" className={cls.abbr}>{ conf.abbr }</Typography>
    </NavLink>
    <Typography variant="h3" className={cls.pageTitle}>报名名单</Typography>

    <div className={cls.inner}>
      { inner }
    </div>

    <RegDetailDialog
      comms={comms || []}

      open={regDetailOpen}
      onClose={closeRegDetail}
      fullWidth

      value={regViewing}
    />
  </BasicLayout>;
});
