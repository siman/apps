import { Comment as SuiComment, Button, Icon } from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';

import { withCalls, withMulti, withApi } from '@polkadot/ui-api/with';
import Section from '@polkadot/joy-utils/Section';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import { ApiProps } from '@polkadot/ui-api/types';
import { ApiPromise } from '@polkadot/api';
import { api } from '@polkadot/ui-api';

import { partition } from 'lodash';
import { PostId, CommentId, Comment, OptionComment, Post } from './types';
import { NewComment } from './EditComment';
import { queryBlogsToProp } from './utils';
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
    commentIds = []
  } = props;

  const commentsCount = commentIds.length;// post.comments_count.toNumber();
  const [loaded, setLoaded] = useState(false);
  const [comments, setComments] = useState(new Array<Comment>());

  useEffect(() => {
    const loadComments = async () => {
      if (!commentsCount) return;
      console.log('CommentsByPost');
      const apiCalls: Promise<OptionComment>[] = commentIds.map(id =>
        api.query.blogs.commentById(id) as Promise<OptionComment>);

      const loadedComments = (await Promise.all<OptionComment>(apiCalls)).map(x => x.unwrap() as Comment);

      setComments(loadedComments);
      setLoaded(true);
    };

    loadComments().catch(err => console.log(err));
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
        <div style={{ marginBottom: '2rem' }}>
          <NewComment postId={postId} />
        </div>
        {renderComments()}
      </Section>);
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
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [commentIdForUpdate, setCommentIdForUpdate] = useState(new CommentId(0));

  const { api, comment, commentsWithParentId } = props;
  const { state: { address: myAddress } } = useMyAccount();
  const [parentComments, childrenComments] = partition(commentsWithParentId, (e) => e.parent_id.eq(comment.id));

  const { id, created: { account, block, time } } = comment;
  const [ text , setText ] = useState(comment.json.body);

  if (!comment || comment.isEmpty) {
    return null;
  }

  useEffect(() => {
    if (!commentIdForUpdate.eq(id)) return;

    console.log('Comment reload');

    api.query.blogs.commentById(commentIdForUpdate, (x => {
      if (x.isNone) return;
      const comment = x.unwrap() as Comment;
      setText(comment.json.body);
      setCommentIdForUpdate(new CommentId(0));
    })).catch(err => console.log(err));

  },[ commentIdForUpdate.toString() && !commentIdForUpdate.eqn(0) ]);

  const isMyStruct = myAddress === account.toString();

  const renderButtonEditForm = () => {
    if (!isMyStruct || showEditForm) return null;

    return <Button
      type='button'
      basic
      onClick={() => setShowEditForm(true)}
    >
        <Icon name='pencil'/>
        Edit
    </Button>;
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
                onSuccess={() => { setShowEditForm(false); setCommentIdForUpdate(id); }}
              />
              : <>
                <SuiComment.Text>{text}</SuiComment.Text>
                <SuiComment.Actions>
                  <SuiComment.Action>
                    {showReplyForm
                      ? <NewComment
                          postId={comment.post_id}
                          parentId={comment.id}
                          onSuccess={() => setShowReplyForm(false)}
                      />
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
