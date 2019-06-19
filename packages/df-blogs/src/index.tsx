
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
import { NewPost, EditPost } from './EditPost';
import { ViewPostById } from './ViewPost';
import { NewComment, EditComment } from './EditComment';
import { ViewCommentById } from './ViewComment';

type Props = AppProps & ApiProps & I18nProps & {
  nextBlogId?: BN
};

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
          <Route path={`${basePath}/posts/:id/edit`} component={EditPost} />
          <Route path={`${basePath}/posts/:id`} component={ViewPostById} />
          <Route path={`${basePath}/comments/:id/edit`} component={EditComment} />
          <Route path={`${basePath}/comments/:id`} component={ViewCommentById} />
          <Route path={`${basePath}/:id/edit`} component={EditBlog} />
          <Route path={`${basePath}/:id/newPost`} component={NewPost} />
          <Route path={`${basePath}/:id/newComment`} component={NewComment} />
          <Route path={`${basePath}/:id`} component={ViewBlogById} />
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
