import React, { useEffect, useState } from 'react';
import { Button, Icon } from 'semantic-ui-react';
import { withFormik, FormikProps } from 'formik';

import TxButton from '@polkadot/joy-utils/TxButton';
import { api, withMulti } from '@polkadot/ui-api';
import { SubmittableResult } from '@polkadot/api';
import { AccountId } from '@polkadot/types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';

import { PostId, Comment, Post, ReactionKind, Reaction } from './types';
import { reactionStateType } from './ViewComment';

type VoterValue = {
  struct: Comment | Post,
  reactionState: reactionStateType,
  setReactionState: (state: reactionStateType) => void
};

type StructType = {
  isComment: boolean;
};

type VoterProps = FormikProps<StructType> & VoterValue;

const InnerVoter = (props: VoterProps) => {
  const {
    struct,
    values,
    setSubmitting,
    reactionState,
    setReactionState
  } = props;

  const { id, upvotes_count, downvotes_count } = struct;
  const { state: { address } } = useMyAccount();
  const { Upvote, Downvote, None } = reactionStateType;
  const [ reaction, setReaction ] = useState(new Reaction());

  const reacrionIsNone = (reactionState === None);
  const dataForQuery = new Tuple([AccountId, PostId], [new AccountId(address), id]);
  useEffect(() => {
    if (reacrionIsNone) return;

    api.query.blogs.commentReactionIdByAccount(dataForQuery, reactionId => {
      api.query.blogs.reactionById(reactionId, x => {
        if (x.isNone) return;
        const reaction = x.unwrap() as Reaction;
        setReaction(reaction);
        console.log(reaction.kind);
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));
  }, [ reactionState ]);
  const onSubmit = (sendTx: () => void) => {
    sendTx();
  };

  const onTxCancelled = () => {
    setSubmitting(false);
  };

  const onTxFailed = (_txResult: SubmittableResult) => {
    setSubmitting(false);
  };

  const onTxSuccessUpvote = (_txResult: SubmittableResult) => {
    console.log(`${Upvote} === ${reactionState} === ${reacrionIsNone}`);
    setReactionState(reactionStateType.Upvote);
    setSubmitting(false);
  };

  const onTxSuccessDownvote = (_txResult: SubmittableResult) => {
    setReactionState(Downvote);
    console.log(`${Downvote} === ${reactionState} === ${reacrionIsNone}`);
    setSubmitting(false);
  };

  const buildTxParams = (param: reactionStateType) => {
    if (reacrionIsNone) {
      return [ id, new ReactionKind(param) ];
    } else if (reactionState === param) {
      return [ id, reaction.id, reaction.kind ];
    } else {
      return [ id, reaction.id ];
    }

  };

  const VoterRender = () => {

    const orientation = values.isComment ? 'vertical' : '';

    return <Button.Group basic className={`DfVoter ${orientation}`}>
      <TxButton
        circular
        compact
        params={buildTxParams(Upvote)}
        tx={reacrionIsNone
          ? 'blogs.createCommentReaction'
          : (reactionState === Upvote)
          ? 'blogs.updateCommentReaction'
          : 'blogs.deleteCommentReaction'}
        onClick={onSubmit}
        txCancelledCb={onTxCancelled}
        txFailedCb={onTxFailed}
        txSuccessCb={onTxSuccessUpvote}
      >
        <Icon className='thumbs up outline'/>
        {upvotes_count.toNumber()}
      </TxButton>
      <TxButton
        circular
        compact
        params={buildTxParams(Downvote)}
        tx={reacrionIsNone
          ? 'blogs.createCommentReaction'
          : (reactionState === Downvote)
          ? 'blogs.updateCommentReaction'
          : 'blogs.deleteCommentReaction'}
        onClick={onSubmit}
        txCancelledCb={onTxCancelled}
        txFailedCb={onTxFailed}
        txSuccessCb={onTxSuccessDownvote}
      >
        <Icon className='thumbs down outline'/>
        {downvotes_count.toNumber()}
      </TxButton>
    </Button.Group>;
  };

  return VoterRender();
};
export const Voter = withMulti<VoterProps>(
  withFormik<VoterProps, StructType>({

  // Transform outer props into form values
    mapPropsToValues: (props): StructType => {
      const { struct } = props;

      if (struct instanceof Comment) {
        return { isComment: true };
      } else {
        return { isComment: false };
      }
    },

    handleSubmit: values => {
      // do submitting things
    }
  })(InnerVoter));
