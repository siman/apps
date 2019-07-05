import { Button } from 'semantic-ui-react'
import React from 'react'
import { Post, Comment } from './types';

type VoterProps = {
  struct: Post | Comment
}

export const Voter = (props: VoterProps) => {
  const { struct } = props;
  const { upvotes_count, downvotes_count } = struct;

  const orientation = struct instanceof Comment ? 'vertical' : '';

  return <Button.Group basic className={`DfVoter ${orientation}`}>
    <Button circular compact icon='thumbs up outline' content={upvotes_count.toNumber()} />
    <Button circular compact icon='thumbs down outline'content={downvotes_count.toNumber()} />
  </Button.Group>
};