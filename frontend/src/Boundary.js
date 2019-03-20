import React from 'react';

import * as Sentry from '@sentry/browser';
import './error.css';

export default class Boundary extends React.Component {
  state = {
    error: null,
  }

  componentDidCatch(error, info) {
    this.setState({ error });

    Sentry.withScope(scope => {
      for(const key in info)
        scope.setExtra(key, info[key]);
      Sentry.captureException(error);
    });
  }

  render() {
    console.log('render');
    if(this.state.error) {
      return <>
        <div className="error">
          <div className="error-title">
            好像出了点问题...
          </div>

          <div className="error-desc">
            <p>
              鸽子都飞走了！
            </p>
            <p>
              我们已经通知了我们中<strong>跑得最快</strong>去追赶鸽子了。如果好心的您碰巧见证了鸽笼是怎么坏掉的，可以告诉我们，来节约一秒的宝贵时间。
            </p>
          </div>

          <button onClick={() => Sentry.showReportDialog()}>
            提交反馈
          </button>
        </div>

        <div className="dove" />
      </>;
    } else {
      return this.props.children;
    }
  }
}
