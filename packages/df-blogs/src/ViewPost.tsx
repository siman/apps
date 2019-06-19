import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Segment } from 'semantic-ui-react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option } from '@polkadot/types';

import { PostId, Post, CommentId } from './types';
import { queryBlogsToProp, UrlHasIdProps, AuthorPreview } from './utils';
import { withMyAccount, MyAccountProps } from '@polkadot/joy-utils/MyAccount';

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
    id,
    commentIds = []
  } = props;

  const post = postById.unwrap();
  const {
    created: { owner, time, block },
    slug,
    json: { title, body, image, tags }
  } = post;

  // TODO show 'Edit' button only if I am owner
  const editPostBtn = () => (
    <Link
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
        <AuthorPreview address={owner} />
      </Segment>
    </>;
  };

  const renderDetails = () => {
    return <>
      <h1 style={{ display: 'flex' }}>
        <span style={{ marginRight: '.5rem' }}>{title}</span>
        {editPostBtn()}
      </h1>
      <AuthorPreview address={owner} />
      <div style={{ margin: '1rem 0' }}>
        {image && <img src={image} className='DfPostImage' /* add onError handler */ />}
        <ReactMarkdown className='JoyMemo--full' source={body} linkTarget='_blank' />
        {/* TODO render tags */}
      </div>
    </>;
  };

  return preview
    ? renderPreview()
    : renderDetails();
}

export const ViewPost = withMulti(
  ViewPostInternal,
  withMyAccount,
  withCalls<ViewPostProps>(
    queryBlogsToProp('postById', 'id'),
    queryBlogsToProp('commentIdsByPostId', { paramName: 'id', propName: 'commentIds' })
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
