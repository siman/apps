
import BN from 'bn.js';
import React from 'react';
import { Route, Switch } from 'react-router';

import { AppProps, I18nProps } from '@polkadot/ui-app/types';
import { ApiProps } from '@polkadot/ui-api/types';
import { withCalls, withMulti } from '@polkadot/ui-api/with';
import Tabs, { TabItem } from '@polkadot/ui-app/Tabs';

import './index.css';

import { queryBlogsToProp } from './utils';
import translate from './translate';
import ListBlogs from './ListBlogs';
import EditBlog from './EditBlog';
import ViewBlogById from './ViewBlogById';

type Props = AppProps & ApiProps & I18nProps & {
  nextBlogId?: BN
};

function BlogsByAccount (p: {}) {
  return <em>TODO BlogsByAccount</em>;
}

function PostsByBlog (p: {}) {
  return <em>TODO PostsByBlog</em>;
}

function PostById (p: {}) {
  return <em>TODO PostById</em>;
}

class App extends React.PureComponent<Props> {

  private buildTabs (): TabItem[] {
    const { t, nextBlogId } = this.props;
    let blogCount = nextBlogId ? nextBlogId.sub(new BN(1)).toNumber() : 0;
    return [
      {
        name: 'blogs',
        text: t('All blogs') + ` (${blogCount})`
      },
      {
        name: 'new',
        text: t('New blog')
      }
    ];
  }

  render () {
    const { basePath } = this.props;
    const tabs = this.buildTabs();
    return (
      <main className='blogs--App'>
        <header>
          <Tabs basePath={basePath} items={tabs} />
        </header>
        <Switch>
          <Route path={`${basePath}/new`} component={EditBlog} />
          <Route path={`${basePath}/:blogId/edit`} component={EditBlog} />
          <Route path={`${basePath}/:blogId`} component={ViewBlogById} />
          <Route path={`${basePath}/:blogId/:postId`} component={PostById} />
          <Route component={ListBlogs} />
        </Switch>
      </main>
    );
  }
}

export default withMulti(
  App,
  translate,
  // withMyAccount, // TODO on tabs 'My blogs'
  withCalls<Props>(
    queryBlogsToProp('nextBlogId')
  )
);
