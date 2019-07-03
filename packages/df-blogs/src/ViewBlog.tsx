import React from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'semantic-ui-react';
import ReactMarkdown from 'react-markdown';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option } from '@polkadot/types';
import IdentityIcon from '@polkadot/ui-app/IdentityIcon';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { formatNumber } from '@polkadot/util';

import { nonEmptyStr } from '@polkadot/joy-utils/index';
import { BlogId, Blog, PostId } from './types';
import { queryBlogsToProp } from './utils';
import { MyAccountProps, withMyAccount } from '@polkadot/joy-utils/MyAccount';
import Section from '@polkadot/joy-utils/Section';
import { ViewPost } from './ViewPost';

type Props = MyAccountProps & {
  preview?: boolean,
  id: BlogId,
  blogById?: Option<Blog>,
  postIds?: PostId[]
};

function Component (props: Props) {
  const { blogById } = props;

  if (blogById === undefined) return <em>Loading...</em>;
  else if (blogById.isNone) return <em>Blog not found</em>;

  const {
    preview = false,
    myAddress,
    postIds = []
  } = props;

  const blog = blogById.unwrap();
  const {
    id,
    created: { account, time, block },
    slug,
    json: { name, desc, image, tags }
  } = blog;

  const isMyBlog = myAddress && account && myAddress === account.toString();
  const hasImage = image && nonEmptyStr(image.toString());
  const postsCount = postIds ? postIds.length : 0;

  const renderPreview = () => {
    return <>
      <div className={`item ProfileDetails ${isMyBlog && 'MyProfile'}`}>
        {hasImage
          ? <img className='ui avatar image' src={image.toString()} />
          : <IdentityIcon className='image' value={account} size={40} />
        }
        <div className='content'>
          <div className='header'>
            <Link to={`/blogs/${id}`} className='handle'>{name.toString()}</Link>
            {isMyBlog &&
              <Link to={`/blogs/${id}/edit`} className='ui tiny button'>
                <i className='pencil alternate icon' />
                Edit my blog
              </Link>
            }
          </div>
          <div className='description'>
            <ReactMarkdown className='JoyMemo--full' source={desc.toString()} linkTarget='_blank' />
          </div>
        </div>
      </div>
    </>;
  };

  if (preview) {
    return renderPreview();
  }

  const renderPostPreviews = () => {
    if (!postIds || postIds.length === 0) {
      return <em>This blog has no posts yet</em>;
    }

    return postIds.map((id, i) => <ViewPost key={i} id={id} preview />);
  };

  const postsSectionTitle = () => {
    return <>
      <span style={{ marginRight: '.5rem' }}>Posts ({postsCount})</span>
      {isMyBlog && <Link to={`/blogs/${id}/newPost`} className='ui tiny button'>
        <i className='plus icon' />
        Write post
      </Link>}
    </>;
  };

  return <>
    <div className='ui massive relaxed middle aligned list FullProfile'>
      {renderPreview()}
    </div>

    <Table celled selectable compact definition className='ProfileDetailsTable'>
    <Table.Body>
      <Table.Row>
        <Table.Cell>Created on</Table.Cell>
        <Table.Cell>{new Date(time).toLocaleString()} at block #{formatNumber(block)}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Created by</Table.Cell>
        <Table.Cell><AddressMini value={account} isShort={false} isPadded={false} size={36} withName withBalance /></Table.Cell>
      </Table.Row>
    </Table.Body>
    </Table>

    <Section title={postsSectionTitle()}>
      {renderPostPreviews()}
    </Section>
  </>;
}

export default withMulti(
  Component,
  withMyAccount,
  withCalls<Props>(
    queryBlogsToProp('blogById', 'id'),
    queryBlogsToProp('postIdsByBlogId', { paramName: 'id', propName: 'postIds' })
  )
);
