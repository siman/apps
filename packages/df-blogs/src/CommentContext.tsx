import React, { useContext, createContext, useReducer } from 'react'

import { CommentId } from './types';

type CommentsUpdateAction = {
  type:  'commentReplied' | 'reloadComment' | 'cleanCommentMode',
  commentId: CommentId
};

type CommentMode = 'replied' | 'reload';

type CommentsUpdateState = {
  commentModeMap: Map<string, CommentMode>
};

function reducer (state: CommentsUpdateState, action: CommentsUpdateAction) {
  const { commentModeMap } = state;
  const id = action.commentId.toString();

  switch (action.type) {
    case 'commentReplied': {
      commentModeMap.set(id, 'replied');
      return { commentModeMap: new Map(commentModeMap) };
    }
    case 'reloadComment': {
      commentModeMap.set(id, 'reload');
      return { commentModeMap: new Map(commentModeMap) };
    }
    case 'cleanCommentMode': {
      commentModeMap.delete(id);
      return { commentModeMap: new Map(commentModeMap) };
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
  commentModeMap: new Map()
};

const InitialContext: commentUpdateContextProps = {
  state: initialStateCommentsUpdate,
  dispatch: functionStub
};

export const MyCommenrUpdate = createContext<commentUpdateContextProps>(InitialContext);

export function CommentUpdateProvider (props: React.PropsWithChildren<{}>) {
  
  const [state, dispatch] = useReducer(reducer, initialStateCommentsUpdate);

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

export function useCommentContext () {
  return useContext(MyCommenrUpdate);
}
