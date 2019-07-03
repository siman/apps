import { Comment as SuiComment, Button } from 'semantic-ui-react'
import React, { useState, useEffect } from 'react'

import { ApiProps } from '@polkadot/ui-api/types';
import { withCalls, withMulti, withApi } from '@polkadot/ui-api/with';

import Section from '@polkadot/joy-utils/Section';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { MyAccountProps } from '@polkadot/joy-utils/MyAccount';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import { ApiProps } from '@polkadot/ui-api/types';
import { partition } from 'lodash';
import { PostId, CommentId, Comment, OptionComment } from './types';
import { NewComment } from './EditComment';
import { queryBlogsToProp } from './utils';

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
  }, [ commentsCount,  ]);//TODO change dependense on post.comments_counts or CommentCreated, CommentUpdated with current postId
  
  const renderView = () => (
    <Section title={`Comments (${commentsCount})`} className='DfCommentsByPost'>
      <NewComment postId={postId} />
      {commentsCount
        ? renderComments() 
      }
        : <em>No comments yet</em>
    </Section>);

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

  const [showEditForm, setShowEditForm] = useState(false);
  const { comment, commentsWithParentId } = props;
  const { state: { address: myAddress } } = useMyAccount();
  
  if (!comment || comment.isEmpty) { 
    return null;
  }

  const [parentComments, childrenComments] = partition(commentsWithParentId, (e) => e.parent_id.eq(comment.id));

  const { account, block, time } = comment.created;
  const { body } = comment.json;

  const isMyStruct = myAddress === account.toString();

  const renderButtonEditForm = () =>{
    if(isMyStruct && !showEditForm){
      return <Button
        type='button'
        onClick={() => setShowEditForm(true)}
        content='Edit'
      />
    }
    return null;
  }

  return(
  <SuiComment.Group threaded>
    <SuiComment>
      <AddressMini value={account} isShort={false} isPadded={false} withName/>
      {renderButtonEditForm()}
      <SuiComment.Metadata>
          <div>{time.toLocaleString()} at block #{block.toNumber()}</div>
        </SuiComment.Metadata>
      <SuiComment.Content>
        {showEditForm ? <NewComment struct={comment} id={comment.id} postId={comment.post_id} cancelEditForm={()=>setShowEditForm(false)}/>:<><SuiComment.Text>{body}</SuiComment.Text>
        <SuiComment.Actions>
          <SuiComment.Action><NewComment postId={comment.post_id} parentId={comment.id} /></SuiComment.Action>
        </SuiComment.Actions></>}
      </SuiComment.Content>
      {renderLevelOfComments(parentComments, childrenComments)}
    </SuiComment>
  </SuiComment.Group>);
}
