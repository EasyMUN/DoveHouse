import React, { useCallback, useState, useEffect } from 'react';

import clsx from 'clsx';

import { makeStyles } from '@material-ui/styles';

import { useDispatch } from 'redux-react-hook';

import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '../overrides/CardActions';
import CardContent from '../overrides/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Avatar from '@material-ui/core/Avatar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import SwipeableViews from 'react-swipeable-views';

import { useRouter } from '../Router';

import { get } from '../store/actions';

import BasicLayout from '../layout/Basic';

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
    justifyContent: 'center',
  },

  card: {
    paddingTop: 20,
    marginTop: 40,
  },

  paymentDesc: {
    textAlign: 'center',
    '$done &': {
      textDecoration: 'line-through',
      textDecorationColor: 'rgba(0,0,0,.3)',
    },
  },

  paymentTotal: {
    '& small': {
      color: 'rgba(0,0,0,.38)',
      textDecoration: 'none',
    },

    margin: '40px 0',
    textAlign: 'center',

    '$done &': {
      textDecoration: 'line-through',
      textDecorationColor: 'rgba(0,0,0,.3)',
    },
  },

  paidHint: {
    display: 'none',
    textAlign: 'center',
    color: 'rgba(0,0,0,.38)',
    marginBottom: 40,
    marginTop: -30,
  },

  done: {
    '& $paidHint': {
      display: 'block',
    },
  },

  qrContainer: {
    padding: 20,
    textAlign: 'center',
  },

  qr: {
    maxWidth: 'calc(100% - 40px)',
  },
}));

export default React.memo(() => {
  const cls = styles();

  const [payment, setPayment] = useState(null);
  const [tab, setTab] = useState(0);

  const { match } = useRouter();
  const dispatch = useDispatch();

  async function fetchPayment() {
    const p = await dispatch(get(`/payment/${match.params.id}`));
    setPayment(p);
  }

  useEffect(() => {
    fetchPayment();
  }, [match]);

  const updateTab = useCallback((ev, t) => setTab(t), [setTab])

  const inner = payment ? <>
    <Typography variant="h2">订单详情</Typography>

    <Card className={clsx(cls.card, { [cls.done]: payment.status === 'paid' })}>
      <CardContent>
        <Typography variant="h4" className={cls.paymentDesc}>{ payment.desc }</Typography>
        <div className={cls.abbrLine}>
          <Avatar src={payment.conf.logo} className={cls.logo}/>
          <Typography variant="body2" className={cls.abbr}>{ payment.conf.abbr }</Typography>
        </div>
        <Typography variant="h3" className={cls.paymentTotal}>{ payment.total } <small>CNY</small></Typography>
        <Typography variant="body1" className={cls.paidHint}>已支付</Typography>
      </CardContent>
      <Tabs
        value={tab}
        onChange={updateTab}
        indicatorColor="secondary"
        textColor="secondary"
        variant="fullWidth"
      >
        { (payment.conf.payments || []).map((p, index) => <Tab key={index} label={p.provider} />) }
      </Tabs>
      <SwipeableViews
        index={tab}
        onChangeIndex={updateTab}
      >
        { (payment.conf.payments || []).map((p, index) => <div key={index} className={cls.qrContainer}>
          <img className={cls.qr} src={p.qr} />
        </div>) }
      </SwipeableViews>
    </Card>
  </> : null;

  return <BasicLayout>
    { inner }
  </BasicLayout>;
});
