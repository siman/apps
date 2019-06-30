import React from 'react';
import { Message } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';

import TxButton from '@polkadot/joy-utils/TxButton';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api/with';

import * as JoyForms from '@polkadot/joy-utils/forms';
import { Text } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import { PostId, CommentId, Comment, CommentUpdate, CommentData } from './types';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import { queryBlogsToProp } from './utils';
import { withOnlyMembers } from '@polkadot/joy-utils/MyAccount';

const buildSchema = (p: ValidationProps) => Yup.object().shape({

  body: Yup.string()
    // .min(p.minTextLen, `Your comment is too short. Minimum length is ${p.minTextLen} chars.`)
    // .max(p.maxTextLen, `Your comment is too long. Maximum length is ${p.maxTextLen} chars.`)
    .required('Comment body is required'),
});

type ValidationProps = {
  // minTextLen: number,
  // maxTextLen: number
};

type OuterProps = ValidationProps & {
  postId: PostId,
  parentId?: CommentId,
  id?: CommentId, 
  struct?: Comment
};

type FormValues = CommentData;

type FormProps = OuterProps & FormikProps<FormValues>;

const LabelledField = JoyForms.LabelledField<FormValues>();

// const LabelledText = JoyForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    postId,
    struct,
    values,
    dirty,
    isValid,
    isSubmitting,
    setSubmitting,
    resetForm
  } = props;

  const {
    body
  } = values;

  const onSubmit = (sendTx: () => void) => {
    if (isValid) sendTx();
  };

  const onTxCancelled = () => {
    setSubmitting(false);
  };

  const onTxFailed = (_txResult: SubmittableResult) => {
    setSubmitting(false);
  };

  const onTxSuccess = (_txResult: SubmittableResult) => {
    setSubmitting(false);
    resetForm();
  };

  const isNew = struct === undefined;

  const buildTxParams = () => {
    if (!isValid) return [];

    const json = JSON.stringify({ body });

    if (!struct) {
      const parentCommentId = new Option(CommentId, null);
      return [ postId, parentCommentId, json ];
    } else if (dirty) {
      const update = new CommentUpdate({
        json: new Text(json)
      });
      return [ struct.id, update ];
    } else {
      console.log('Nothing to update in a comment');
      return [];
    }
  };

  const form =
    <Form className='ui form JoyForm EditEntityForm'>

      <LabelledField name='body' {...props}>
        <Field component='textarea' id='body' name='body' disabled={isSubmitting} rows={5} placeholder={`Write a comment...`} />
      </LabelledField>

      <LabelledField {...props}>
        <TxButton
          type='submit'
          size='large'
          label={isNew
            ? `Comment`
            : `Update my comment`
          }
          isDisabled={!dirty || isSubmitting}
          params={buildTxParams()}
          tx={struct
            ? 'blogs.updateComment'
            : 'blogs.createComment'
          }
          onClick={onSubmit}
          txCancelledCb={onTxCancelled}
          txFailedCb={onTxFailed}
          txSuccessCb={onTxSuccess}
        />
      </LabelledField>
    </Form>;

  return <>
    {form}
  </>;
};

const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { struct } = props;

    if (struct) {
      const { json } = struct;
      return {
        ...json
      };
    } else {
      return {
        body: ''
      };
    }
  },

  validationSchema: buildSchema,

  handleSubmit: values => {
    // do submitting things
  }
})(InnerForm);

type LoadStructProps = OuterProps & {
  structOpt: Option<Comment>
};

function LoadStruct (props: LoadStructProps) {
  const { state: { address: myAddress } } = useMyAccount();
  const { structOpt } = props;

  if (!myAddress || !structOpt) {
    return <em>Loading comment...</em>;
  }

  if (structOpt.isNone) {
    return <em>Comment not found</em>;
  }

  const struct = structOpt.unwrap();
  const isMyStruct = myAddress === struct.created.account.toString();

  if (isMyStruct) {
    return <EditForm {...props} struct={struct} />;
  }

  return <Message error className='JoyMainStatus' header='You are not allowed edit this comment.' />;
}

export const EditComment = withMulti(
  LoadStruct,
  withCalls<OuterProps>(
    queryBlogsToProp('commentById',
      { paramName: 'id', propName: 'structOpt' })
  )
);

export const NewComment = withMulti(
  EditForm,
  withOnlyMembers
);
