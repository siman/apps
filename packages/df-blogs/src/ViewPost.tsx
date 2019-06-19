import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Segment } from 'semantic-ui-react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option } from '@polkadot/types';

import Section from '@polkadot/joy-utils/Section';
import { PostId, Post, CommentId } from './types';
import { queryBlogsToProp, UrlHasIdProps, AuthorPreview } from './utils';
import { withMyAccount, MyAccountProps } from '@polkadot/joy-utils/MyAccount';
import { ViewComment } from './ViewComment';

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
    created: { account, time, block },
    slug,
    json: { title, body, image, tags }
  } = post;

  const commentsCount = commentIds ? commentIds.length : 0;

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
        <AuthorPreview address={account} />
      </Segment>
    </>;
  };

  const renderCommentPreviews = () => {
    if (!commentIds || commentIds.length === 0) {
      return <em>This blog has no posts yet</em>;
    }

    return commentIds.map((id, i) => <ViewComment key={i} id={id} preview />);
  };

  const commentsSectionTitle = () => {
    return <>
      <span style={{ marginRight: '.5rem' }}>Comments ({commentsCount})</span>
      <Link to={`/blogs/${id}/newComment`} className='ui tiny button'>
        <i className='plus icon' />
        Write comment
      </Link>
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
      <Section title={commentsSectionTitle()}>
        {renderCommentPreviews()}
      </Section>
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
