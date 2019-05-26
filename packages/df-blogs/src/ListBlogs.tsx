import BN from 'bn.js';
import React from 'react';

import { ApiProps } from '@polkadot/ui-api/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { withCalls } from '@polkadot/ui-api/with';

import Section from '@polkadot/joy-utils/Section';
import { queryBlogsToProp } from './utils';
import translate from './translate';
import ViewBlog from './ViewBlog';
import { BlogId } from './types';

type Props = ApiProps & I18nProps & {
  nextBlogId?: BN
};

class Component extends React.PureComponent<Props> {

  render () {
    const { nextBlogId = new BlogId(1) } = this.props;

    const firstBlogId = new BlogId(1);
    const totalCount = nextBlogId.sub(firstBlogId).toNumber();
    const ids: BlogId[] = [];
    if (totalCount > 0) {
      const firstId = firstBlogId.toNumber();
      const lastId = nextBlogId.toNumber();
      for (let i = firstId; i < lastId; i++) {
        ids.push(new BlogId(i));
      }
    }

    return (
      <Section title={`All Blogs (${totalCount})`}>{
        ids.length === 0
          ? <em>No blogs created yet.</em>
          : <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
              {ids.map((id, i) =>
                <ViewBlog {...this.props} key={i} id={id} preview />
              )}
            </div>
      }</Section>
    );
  }
}

export default translate(
  withCalls<Props>(
    queryBlogsToProp('nextBlogId')
  )(Component)
);
