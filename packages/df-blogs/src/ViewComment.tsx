import React from 'react'
import { Header, Comment as SuiComment } from 'semantic-ui-react'

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option } from '@polkadot/types';

import { PostId, CommentId, Comment } from './types';
import { queryBlogsToProp, AuthorPreview } from './utils';
import { MyAccountProps, withMyAccount } from '@polkadot/joy-utils/MyAccount';
import Section from '@polkadot/joy-utils/Section';

import { NewComment } from './EditComment';
import { AddressMini } from '@polkadot/ui-app';


type Props = MyAccountProps & {
  postId: PostId,
  commentIds?: CommentId[]
};

function InnerCommentsByPost (props: Props) {

  const {
    myAddress,
    postId,
    commentIds = []
  } = props;

  const commentsCount = commentIds ? commentIds.length : 0;
  
  if (!commentIds || commentIds.length === 0) {
    return <Section title={`Comments (${commentsCount})`}>
      <NewComment postId={postId} />
    </Section>
  }

  return <Section title={`Comments (${commentsCount})`}>
    <NewComment postId={postId} />
    {commentIds.map((id,i) => <ViewComment key={i} id={id}/>)}
  </Section>
}

export const CommentsByPost = withMulti(
  InnerCommentsByPost,
  withMyAccount,
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
  const { account, time } =  comment.created;
  const { body } = comment.json;

  return(
  <SuiComment.Group threaded>
    <SuiComment style={{ border: '1px solid grey', padding: '1rem', borderRadius: '1rem' }}>
      {/* <AuthorPreview address={account} /> */}
      <AddressMini value={account} isShort={false} isPadded={false} size={48} withName/>
      <SuiComment.Metadata>
          <div>{time.toLocaleString()}</div>
        </SuiComment.Metadata>
      <SuiComment.Content>
        <SuiComment.Text style={{ marginTop: '.5rem'}}>{body}</SuiComment.Text>
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
