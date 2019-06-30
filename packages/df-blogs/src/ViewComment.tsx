import React, { useState, useEffect } from 'react'
import { Comment as SuiComment } from 'semantic-ui-react'

import { withCalls, withMulti, withApi } from '@polkadot/ui-api/with';

import { PostId, CommentId, Comment, OptionComment } from './types';
import { queryBlogsToProp } from './utils';
import Section from '@polkadot/joy-utils/Section';

import { NewComment } from './EditComment';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { partition } from 'lodash';
import { ApiProps } from '@polkadot/ui-api/types';

type Props = ApiProps & {
  postId: PostId,
  commentIds?: CommentId[]
};

const renderViewComments = (comments:[Comment[],Comment[]]) => {
  return comments[0].map((comment, i) =>
   <ViewComment key={i} comment={comment} commentsWithParentId={comments[1]}/>)
}

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

      const apiCalls: Promise<OptionComment>[] = commentIds.map( id =>
        api.query.blogs.commentById(id) as Promise<OptionComment>);

      const loadedComments = (await Promise.all<OptionComment>(apiCalls)).map(x => x.unwrap() as Comment);

      setComments(loadedComments);
      setLoaded(true);
    };

    loadComments();
  }, [ commentsCount ]);//TODO change dependense on post.comments_counts or CommentCreated, CommentUpdated with current postId
  
  const renderView = () => (
    <Section title={`Comments (${commentsCount})`} className='DfCommentsByPost'>
      <NewComment postId={postId} />
      {commentsCount
        ? renderComments() 
        : <em>No comments yet</em>
      }
    </Section>);

  if (!commentsCount) {
    return renderView();
  }


  const renderComments = () => {
    if (!loaded) {
      return <em>Loading comments...</em>;
    }

    const rootComments = partition(comments, (e) => {return e.parent_id.isNone});
    return renderViewComments(rootComments);
  };

  return renderView();
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
}

export function ViewComment (props: ViewCommentProps) {

  const { comment, commentsWithParentId } = props;

  if (!comment || comment.isEmpty) {
    return null;
  }

  const newCommentsWithParentId = partition(commentsWithParentId, (e) => {
    return (e.parent_id.toString() == comment.id.toString())});

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
      <SuiComment.Group>
        {renderViewComments(newCommentsWithParentId)}
      </SuiComment.Group>
    </SuiComment>
  </SuiComment.Group>);
}
