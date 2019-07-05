import React, { useContext, createContext, useReducer } from 'react'

import { CommentId } from './types';

type CommentsUpdateAction = {
  type: 'addUpdatedComment' | 'removeUpdatedComment',
  commentId: CommentId
};

type CommentsUpdateState = {
  updatedCommentIds: CommentId[]
};

function reducer (state: CommentsUpdateState, action: CommentsUpdateAction) {
  switch (action.type) {
    case 'addUpdatedComment': {
      const returnState: CommentsUpdateState = {
        updatedCommentIds: [ ...state.updatedCommentIds, action.commentId ]
      }
      return returnState;
    }
    case 'removeUpdatedComment': {
      const returnState: CommentsUpdateState = {
        updatedCommentIds: state.updatedCommentIds.filter(id => id.eq(action.commentId))
      }
      return returnState;
    }
    default: {
      console.log('Unknown action type:', action.type);
      return state;
    }
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
  updatedCommentIds: [] as CommentId[]
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
