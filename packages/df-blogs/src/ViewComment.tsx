import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Segment } from 'semantic-ui-react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option } from '@polkadot/types';

import { PostId, Comment, CommentId } from './types';
import { queryBlogsToProp, UrlHasIdProps, AuthorPreview } from './utils';
import { withMyAccount, MyAccountProps } from '@polkadot/joy-utils/MyAccount';

type ViewCommentProps = MyAccountProps & {
  preview?: boolean,
  id: PostId,
  commentById: Option<Comment>
};

function ViewCommentInternal (props: ViewCommentProps) {
  const { commentById } = props;

  if (commentById === undefined) return <em>Loading...</em>;
  else if (commentById.isNone) return <em>Comment not found</em>;

  const {
    myAddress,
    preview = false,
    id
  } = props;

  const comment = commentById.unwrap();
  const {
    created: { account, time, block },
    json: { body }
  } = comment;

  // TODO show 'Edit' button only if I am owner
  const editCommentBtn = () => (
    <Link
      to={`/blogs/comments/${id.toString()}/edit`}
      className='ui small button'
      style={{ marginLeft: '.5rem' }}
    >
      <i className='pencil alternate icon' />
      Edit
    </Link>
  );

  const renderPreview = () => {
    let commentTitle = body.substring(0, 20);
    if (body.length > 20) {
      commentTitle += '...';
    }
    return <>
      <Segment>
        <h2>
          <Link
            to={`/blogs/comments/${id.toString()}`}
            style={{ marginRight: '.5rem' }}
          >
          {commentTitle}
          </Link>
          {editCommentBtn()}
        </h2>
        <AuthorPreview address={account} />
      </Segment>
    </>;
  };

  const renderDetails = () => {
    let commentTitle = body.substring(0, 20);
    if (body.length > 20) {
      commentTitle += '...';
    }
    return <>
      <h1 style={{ display: 'flex' }}>
        <span style={{ marginRight: '.5rem' }}>{commentTitle}</span>
        {editCommentBtn()}
      </h1>
      <AuthorPreview address={account} />
      <div style={{ margin: '1rem 0' }}>
        <h3>Commented at {new Date(time).toLocaleString()}:</h3>
        <ReactMarkdown className='JoyMemo--full' source={body} linkTarget='_blank' />
      </div>
    </>;
  };

  return preview
    ? renderPreview()
    : renderDetails();
}

export const ViewComment = withMulti(
  ViewCommentInternal,
  withMyAccount,
  withCalls<ViewCommentProps>(
    queryBlogsToProp('commentById', 'id')
  )
);

export function ViewCommentById (props: UrlHasIdProps) {
  const { match: { params: { id } } } = props;
  try {
    return <ViewComment id={new CommentId(id)} />;
  } catch (err) {
    return <em>Invalid comment ID: {id}</em>;
  }
}
