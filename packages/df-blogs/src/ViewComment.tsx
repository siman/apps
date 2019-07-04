import { Comment as SuiComment, Button } from 'semantic-ui-react'
import React, { useState, useEffect, useContext, createContext, useReducer } from 'react'

import { withCalls, withMulti, withApi } from '@polkadot/ui-api/with';

import Section from '@polkadot/joy-utils/Section';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';

import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import { ApiProps } from '@polkadot/ui-api/types';
import { partition } from 'lodash';
import { PostId, CommentId, Comment, OptionComment } from './types';
import { NewComment } from './EditComment';
import { queryBlogsToProp } from './utils';
import { ApiPromise } from '@polkadot/api';
import { api } from '@polkadot/ui-api';

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
  const { state: { commentsUpdateIds, inited }, dispatch } = useCommentUpdate();
  const [parentComments, childrenComments] = partition(commentsWithParentId, (e) => e.parent_id.eq(comment.id));

  const { id, created:{ account, block, time } } = comment;
  const [ text , setText ] = useState(comment.json.body);

  if (!comment || comment.isEmpty) { 
    return null;
  }
  useEffect(() => {
    if(!inited){
      return;
    }
    const loadComments = async () => {
      if (commentsUpdateIds.length === 0) return;
      let commentIdForUpdate;
      commentsUpdateIds.forEach((value, index) =>{
        if (value.toString() === id.toString()){
          commentIdForUpdate = value;
      }}); 
      const apiCalls: Promise<OptionComment> = api.query.blogs.commentById(commentIdForUpdate) as Promise<OptionComment>;

      const loadedComment = (await (apiCalls)).unwrap() as Comment;
      const { json } = loadedComment;
      setText(json.body);
      dispatch({type: 'forget', commentId: {} as CommentId});
      };

    loadComments();
  },[ inited == true ]);

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
        {showEditForm ? <NewComment struct={comment} id={comment.id} postId={comment.post_id} cancelEditForm={()=>setShowEditForm(false)}/>:<><SuiComment.Text>{text}</SuiComment.Text>
        <SuiComment.Actions>
          <SuiComment.Action><NewComment postId={comment.post_id} parentId={comment.id} /></SuiComment.Action>
        </SuiComment.Actions></>}
      </SuiComment.Content>
      {renderLevelOfComments(parentComments, childrenComments)}
    </SuiComment>
  </SuiComment.Group>);
}

type CommentsUpdateAction = {
  type: 'set' | 'forget' | 'forgetExact',
  commentId: CommentId
};
type CommentsUpdateState = {
  inited: boolean,
  commentsUpdateIds: CommentId[]
};
function reducer (state: CommentsUpdateState, action: CommentsUpdateAction ) {
  switch (action.type) {
    case 'set':{
      const returnState: CommentsUpdateState = {
        inited: true,
        commentsUpdateIds: [ ...state.commentsUpdateIds, action.commentId ]
      }
      return returnState;
    }
    case 'forget':{
      const returnState: CommentsUpdateState = {
        inited: false,
        commentsUpdateIds: [action.commentId]
      }
      return returnState;
    }
    default:
      return state;
  }
}

function functionStub () {
  throw new Error('Function needs to be set in Provider');
}

export type commentUpdateContextProps = {
  state: CommentsUpdateState,
  dispatch: React.Dispatch<CommentsUpdateAction>
};
const initialStateCommentsUpdate: CommentsUpdateState = {
  inited: false,
  commentsUpdateIds: [] as CommentId[]
};

const InitialContext: commentUpdateContextProps = {
  state: initialStateCommentsUpdate,
  dispatch: functionStub
};

export const MyCommenrUpdate = createContext<commentUpdateContextProps>(InitialContext);

export function CommentUpdateProvider (props: React.PropsWithChildren<{}>) {
  
  const [state, dispatch] = useReducer(reducer,initialStateCommentsUpdate);

  const contextValue = {
    state,
    dispatch
  };
  return (
    <MyCommenrUpdate.Provider value={contextValue}>
      {props.children}
    </MyCommenrUpdate.Provider>
  );
}

export function useCommentUpdate () {
  return useContext(MyCommenrUpdate);
}
