import React from 'react';

import { I18nProps } from '@polkadot/ui-app/types';

import translate from './translate';
import ViewBlog from './ViewBlog';
import { BlogId } from './types';

type Props = I18nProps & {
  match: {
    params: {
      blogId: string
    }
  }
};

class Component extends React.PureComponent<Props> {
  render () {
    const { match: { params: { blogId } } } = this.props;
    return blogId
     ? <div className='ui massive relaxed middle aligned list FullProfile'>
      <ViewBlog blogId={new BlogId(blogId)} />
    </div>
     : null;
  }
}

export default translate(Component);
