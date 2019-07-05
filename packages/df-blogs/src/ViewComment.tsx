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
import { PostId, CommentId, Comment, OptionComment, Post } from './types';
import { NewComment } from './EditComment';
import { queryBlogsToProp } from './utils';
import { CommentUpdateProvider, useCommentContext } from './CommentContext';
import { Voter } from './Voter';

type Props = ApiProps & {
  postId: PostId,
  post: Post,
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
    post,
    commentIds = []
  } = props;

  const commentsCount = commentIds.length //post.comments_count.toNumber();
  const [loaded, setLoaded] = useState(false);
  const [comments, setComments] = useState(new Array<Comment>());

  useEffect(() => {
    const loadComments = async () => {
      if (!commentsCount) return;

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
        <div style={{ marginBottom: '2rem' }}> 
          <NewComment postId={postId} />
        </div>
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

  const { api, comment, commentsWithParentId } = props;
  const { id, created:{ account, block, time }, upvotes_count, downvotes_count } = comment;

  const { state: { address: myAddress } } = useMyAccount();
  const { state: { commentModeMap }, dispatch } = useCommentContext();

  console.log({ commentModeMap });

  const [ showEditForm, setShowEditForm ] = useState(false); //commentModeMap.has(id.toString());
  const [ showReplyForm, setShowReplyForm ] = useState(false);
  const [ text , setText ] = useState(comment.json.body);
  const [ parentComments, childrenComments ] = partition(commentsWithParentId, e => e.parent_id.eq(comment.id));

  if (!comment || comment.isEmpty) { 
    return null;
  }

  if (commentModeMap.get(id.toString()) === 'replied') {
    setShowReplyForm(false);
    // dispatch({ type: 'cleanCommentMode', commentId: id });
  }

  useEffect(() => {

    console.log('here');
    const reloadComment = async () => {
      if (!commentModeMap || !commentModeMap.has(id.toString())) return;
      console.log('here2');
      const loadedCommentOpt = (await api.query.blogs.commentById(id)) as Option<Comment>;
      if (loadedCommentOpt.isNone) return;

      const loadedComment = loadedCommentOpt.unwrap();
      setText(loadedComment.json.body);
      dispatch({ type: 'cleanCommentMode', commentId: id });
      setShowEditForm(false);
    };

    reloadComment();
  }, [ commentModeMap.size > 0 ]);

  const isMyStruct = myAddress === account.toString();

  const renderButtonEditForm = () => { 
    if (!isMyStruct || showEditForm) return null;

    return (
      <Button
        type='button'
        basic
        onClick={() => setShowEditForm(true)}
      >
        <Icon name='pencil'/>
        Edit
      </Button>
    );
  };

  const replyButton = () => (
    <Button
      type='button'
      basic
      onClick={() => setShowReplyForm(true)}
      content='Reply'
    />);

  return <div>
  <SuiComment.Group threaded>
    <SuiComment>
      <div className='DfCommentBox'>
        <Voter struct={comment} />
        <div>
          <SuiComment.Metadata>
            <AddressMini value={account} isShort={false} isPadded={false} withName/>
            {renderButtonEditForm()}
            <div>{time.toLocaleString()} at block #{block.toNumber()}</div>
          </SuiComment.Metadata>
          <SuiComment.Content>
            {showEditForm 
              ? <NewComment 
                struct={comment}
                id={comment.id}
                postId={comment.post_id}
              />
              : <>
                <SuiComment.Text>{text}</SuiComment.Text>
                <SuiComment.Actions>
                  <SuiComment.Action>
                    {showReplyForm
                      ? <NewComment postId={comment.post_id} parentId={comment.id} />
                      : replyButton()
                    }
                  </SuiComment.Action>
                </SuiComment.Actions>
              </>}
          </SuiComment.Content>
        </div>
      </div>
      {renderLevelOfComments(parentComments, childrenComments)}
    </SuiComment>
  </SuiComment.Group>
</div>;
}
