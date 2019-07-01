import React, { useState, useEffect } from 'react';
import { Comment as SuiComment } from 'semantic-ui-react';
import { partition } from 'lodash';

import { ApiProps } from '@polkadot/ui-api/types';
import { withCalls, withMulti, withApi } from '@polkadot/ui-api/with';

import Section from '@polkadot/joy-utils/Section';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { queryBlogsToProp } from './utils';
import { PostId, CommentId, Comment, OptionComment } from './types';
import { NewComment } from './EditComment';

type Props = ApiProps & {
  postId: PostId,
  commentIds?: CommentId[]
};

const renderLevelOfComments = (parentComments: Comment[], childrenComments: Comment[]) => {
  return parentComments.map((comment, i) =>
   <ViewComment key={i} comment={comment} commentsWithParentId={childrenComments}/>);
};

function InnerCommentsByPost (props: Props) {
  const {
    api,
    postId,
    commentIds = []
  } = props;

  const commentsCount = commentIds ? commentIds.length : 0;
  const [loaded, setLoaded] = useState(false);
  const [comments, setComments] = useState(new Array<Comment>());

  useEffect(() => {
    const loadComments = async () => {
      if (commentsCount === 0) return;

      const apiCalls: Promise<OptionComment>[] = commentIds.map(id =>
        api.query.blogs.commentById(id) as Promise<OptionComment>);

      const loadedComments = (await Promise.all<OptionComment>(apiCalls)).map(x => x.unwrap() as Comment);

      setComments(loadedComments);
      setLoaded(true);
    };

    loadComments();
  }, [ commentsCount ]);// TODO change dependense on post.comments_counts or CommentCreated, CommentUpdated with current postId

  const renderComments = () => {
    if (!commentsCount) {
      return null;
    }

    if (!loaded) {
      return <div style={{ marginTop: '1rem' }}><em>Loading comments...</em></div>;
    }

    const [parentComments, childrenComments] = partition(comments, e => e.parent_id.isNone);
    return renderLevelOfComments(parentComments, childrenComments);
  };

  return (
    <Section title={`Comments (${commentsCount})`} className='DfCommentsByPost'>
      <NewComment postId={postId} />
      {renderComments()}
    </Section>
  );
}

export const CommentsByPost = withMulti(
  InnerCommentsByPost,
  withApi,
  withCalls<Props>(
    queryBlogsToProp('commentIdsByPostId', { paramName: 'postId', propName: 'commentIds' })
  )
);

type ViewCommentProps = {
  comment: Comment,
  commentsWithParentId: Comment[];
};

export function ViewComment (props: ViewCommentProps) {

  const { comment, commentsWithParentId } = props;

  if (!comment || comment.isEmpty) {
    return null;
  }

  const [parentComments, childrenComments] = partition(commentsWithParentId, (e) => e.parent_id.eq(comment.id));

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
          <SuiComment.Action><NewComment postId={comment.post_id} parentId={comment.id} /></SuiComment.Action>
        </SuiComment.Actions>
      </SuiComment.Content>
      {renderLevelOfComments(parentComments, childrenComments)}
    </SuiComment>
  </SuiComment.Group>);
}
