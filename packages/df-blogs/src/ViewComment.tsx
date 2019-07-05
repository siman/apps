import { Comment as SuiComment, Button, Icon } from 'semantic-ui-react'
import React, { useState, useEffect } from 'react'

import { withCalls, withMulti, withApi } from '@polkadot/ui-api/with';
import Section from '@polkadot/joy-utils/Section';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import { ApiProps } from '@polkadot/ui-api/types';
import { Option } from '@polkadot/types/codec';
import { ApiPromise } from '@polkadot/api';
import { api } from '@polkadot/ui-api';

import { partition } from 'lodash';
import { PostId, CommentId, Comment, OptionComment } from './types';
import { NewComment } from './EditComment';
import { queryBlogsToProp } from './utils';
import { CommentUpdateProvider, useCommentUpdate } from './CommentContext';

type Props = ApiProps & {
  postId: PostId,
  commentIds?: CommentId[]
};

const renderLevelOfComments = (parentComments: Comment[], childrenComments: Comment[]) => {
  return parentComments.map((comment, i) =>
   <ViewComment key={i} comment={comment} commentsWithParentId={childrenComments} api={api}/>);
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
  }, [ commentsCount ]);//TODO change dependense on post.comments_counts or CommentCreated, CommentUpdated with current postId

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
    <CommentUpdateProvider>
      <Section title={`Comments (${commentsCount})`} className='DfCommentsByPost'>
        <NewComment postId={postId} />
        {renderComments()}
      </Section>
    </CommentUpdateProvider>);
}

export const CommentsByPost = withMulti(
  InnerCommentsByPost,
  withApi,
  withCalls<Props>(
    queryBlogsToProp('commentIdsByPostId', { paramName: 'postId', propName: 'commentIds' })
  )
);

type ViewCommentProps = {
  api: ApiPromise,
  comment: Comment,
  commentsWithParentId: Comment[];
};

export function ViewComment (props: ViewCommentProps) {

  const [showEditForm, setShowEditForm] = useState(false);
  const { api, comment, commentsWithParentId } = props;
  const { state: { address: myAddress } } = useMyAccount();
  const { state: { updatedCommentIds }, dispatch } = useCommentUpdate();
  const [parentComments, childrenComments] = partition(commentsWithParentId, (e) => e.parent_id.eq(comment.id));

  const { id, created:{ account, block, time } } = comment;
  const [ text , setText ] = useState(comment.json.body);

  if (!comment || comment.isEmpty) { 
    return null;
  }

  useEffect(() => {

    const reloadComment = async () => {
      if (!updatedCommentIds) return;

      const commentIdForUpdate = updatedCommentIds.find(otherId => otherId.eq(id));
      if (!commentIdForUpdate) return;

      const apiCalls: Promise<Option<Comment>> = 
        api.query.blogs.commentById(commentIdForUpdate) as Promise<Option<Comment>>;

      const loadedCommentOpt = await apiCalls;
      if (loadedCommentOpt.isNone) return;

      const loadedComment = loadedCommentOpt.unwrap();

      setText(loadedComment.json.body);
      dispatch({ type: 'removeUpdatedComment', commentId: loadedComment.id });
    };

    reloadComment();
  },[ updatedCommentIds.length ]);

  const isMyStruct = myAddress === account.toString();

  const renderButtonEditForm = () => { 
    if (!isMyStruct || showEditForm) return null;

    return <Button
      type='button'
      onClick={() => setShowEditForm(true)}>
        <Icon name='pencil'/>
        Edit
      </Button>;
  };

  // const renderUpAndDownVote = () => {
  //   return <Button.Group basic vertical className='DfUpAndDownVote'>
  //     <Button circular compact icon='thumbs up outline' content='0' />
  //     <Button circular compact icon='thumbs down outline'content='0' />
  //   </Button.Group>
  // };

  return (
  <SuiComment.Group threaded>
    <SuiComment>
      {/* {renderUpAndDownVote()} */}
      <AddressMini value={account} isShort={false} isPadded={false} withName/>
      {renderButtonEditForm()}
      <SuiComment.Metadata>
          <div>{time.toLocaleString()} at block #{block.toNumber()}</div>
        </SuiComment.Metadata>
      <SuiComment.Content>
        {showEditForm 
          ? <NewComment 
            struct={comment}
            id={comment.id}
            postId={comment.post_id}
            cancelEditForm={()=>setShowEditForm(false)}
          />
          : <>
            <SuiComment.Text>{text}</SuiComment.Text>
            <SuiComment.Actions>
              <SuiComment.Action>
                <NewComment postId={comment.post_id} parentId={comment.id} />
              </SuiComment.Action>
            </SuiComment.Actions>
          </>}
      </SuiComment.Content>
      {renderLevelOfComments(parentComments, childrenComments)}
    </SuiComment>
  </SuiComment.Group>);
}
