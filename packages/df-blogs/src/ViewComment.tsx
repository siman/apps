import React from 'react'
import { Comment as SuiComment } from 'semantic-ui-react'

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option } from '@polkadot/types';

import { PostId, CommentId, Comment } from './types';
import { queryBlogsToProp } from './utils';
import Section from '@polkadot/joy-utils/Section';

import { NewComment } from './EditComment';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';

type Props = {
  postId: PostId,
  commentIds?: CommentId[]
};

function InnerCommentsByPost (props: Props) {

  const {
    postId,
    commentIds = []
  } = props;

  const commentsCount = commentIds ? commentIds.length : 0;

  return <Section title={`Comments (${commentsCount})`} className='DfCommentsByPost'>
    <NewComment postId={postId} />
    {commentsCount
      ? commentIds.map((id, i) => <ViewComment key={i} id={id} />)
      : <em>No comments yet</em>
    }
  </Section>
}

export const CommentsByPost = withMulti(
  InnerCommentsByPost,
  withCalls<Props>(
    queryBlogsToProp('commentIdsByPostId', { paramName: 'postId', propName: 'commentIds' })
  )
);

type ViewCommentProps = {
  id: CommentId,
  comment?: Comment,
  commentById?: Option<Comment>
}

function InnerViewComment (props: ViewCommentProps) {

  const { commentById } = props;

  if (!commentById || commentById.isNone) {
    return null;
  }

  const comment = commentById.unwrap();
  const { account, block, time } = comment.created;
  const { body } = comment.json;

  return(
  <SuiComment.Group threaded>
    <SuiComment>
      <AddressMini value={account} isShort={false} isPadded={false} withName/>
      <SuiComment.Metadata>
          <div>{time.toLocaleString()} at block #{block.toNumber()}</div>
        </SuiComment.Metadata>
      <SuiComment.Content>
        <SuiComment.Text>{body}</SuiComment.Text>
        <SuiComment.Actions>
          <SuiComment.Action>Reply</SuiComment.Action>
        </SuiComment.Actions>
      </SuiComment.Content>
    </SuiComment>
  </SuiComment.Group>);
}

export const ViewComment = withMulti(
  InnerViewComment,
  withCalls<Props>(
    queryBlogsToProp('commentById', 'id')
  )
);
