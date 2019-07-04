import React, { useContext, useReducer, createContext } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Segment } from 'semantic-ui-react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option } from '@polkadot/types';

import { PostId, Post, CommentId } from './types';
import { queryBlogsToProp, UrlHasIdProps, AuthorPreview } from './utils';
import { withMyAccount, MyAccountProps } from '@polkadot/joy-utils/MyAccount';
import { CommentsByPost } from './ViewComment';

type ViewPostProps = MyAccountProps & {
  preview?: boolean,
  id: PostId,
  postById: Option<Post>,
  commentIds?: CommentId[]
};

function ViewPostInternal (props: ViewPostProps) {
  const { postById } = props;

  if (postById === undefined) return <em>Loading...</em>;
  else if (postById.isNone) return <em>Post not found</em>;

  const {
    myAddress,
    preview = false,
    id
  } = props;

  const post = postById.unwrap();
  const {
    created: { account, time, block },
    slug,
    json: { title, body, image, tags }
  } = post;

  const isMyStruct = myAddress === account.toString();

  const editPostBtn = () => (
    isMyStruct && <Link
      to={`/blogs/posts/${id.toString()}/edit`}
      className='ui small button'
      style={{ marginLeft: '.5rem' }}
    >
      <i className='pencil alternate icon' />
      Edit
    </Link>
  );

  const renderPreview = () => {
    return <>
      <Segment>
        <h2>
          <Link
            to={`/blogs/posts/${id.toString()}`}
            style={{ marginRight: '.5rem' }}
          >{title}
          </Link>
          {editPostBtn()}
        </h2>
        <AuthorPreview address={account} />
      </Segment>
    </>;
  };

  const renderDetails = () => {
    return <>
      <h1 style={{ display: 'flex' }}>
        <span style={{ marginRight: '.5rem' }}>{title}</span>
        {editPostBtn()}
      </h1>
      <AuthorPreview address={account} />
      <div style={{ margin: '1rem 0' }}>
        {image && <img src={image} className='DfPostImage' /* add onError handler */ />}
        <ReactMarkdown className='JoyMemo--full' source={body} linkTarget='_blank' />
        {/* TODO render tags */}
      </div>
        <CommentsByPost postId={post.id}/>
    </>;
  };
  return preview
    ? renderPreview()
    : renderDetails();
}

export const ViewPost = withMulti(
  ViewPostInternal,
  withMyAccount,//TODO replese with useMyAccount
  withCalls<ViewPostProps>(
    queryBlogsToProp('postById', 'id')
  )
);

export function ViewPostById (props: UrlHasIdProps) {
  const { match: { params: { id } } } = props;
  try {
    return <ViewPost id={new PostId(id)} />;
  } catch (err) {
    return <em>Invalid post ID: {id}</em>;
  }
}