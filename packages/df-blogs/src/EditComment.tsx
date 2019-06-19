import React, { useState } from 'react';
import { Button, Message } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { History } from 'history';

import TxButton from '@polkadot/joy-utils/TxButton';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api/with';

import * as JoyForms from '@polkadot/joy-utils/forms';
import { AccountId, Text, Bool } from '@polkadot/types';
import { Option, Vector } from '@polkadot/types/codec';
import { PostId, Post, PostData, PostUpdate, BlogId } from './types';
import Section from '@polkadot/joy-utils/Section';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import { queryBlogsToProp, UrlHasIdProps } from './utils';
import { CommentId, Comment, CommentUpdate, CommentData } from './types';

const buildSchema = (p: ValidationProps) => Yup.object().shape({
  body: Yup.string()
    // .min(p.minTextLen, `Your post is too short. Minimum length is ${p.minTextLen} chars.`)
    // .max(p.maxTextLen, `Your post description is too long. Maximum length is ${p.maxTextLen} chars.`)
    .required('Comment body is required')
});

type ValidationProps = {
  // minTitleLen: number,
  // maxTitleLen: number,
  // minTextLen: number,
  // maxTextLen: number
};

type OuterProps = ValidationProps & {
  history?: History,
  id?: PostId,
  commentId?: CommentId,
  struct?: Comment
};

type FormValues = CommentData & {
  body: string
};

type FormProps = OuterProps & FormikProps<FormValues>;

const LabelledField = JoyForms.LabelledField<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    history,
    id,
    commentId,
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

    // TODO get id of newly created post and redirect.
    // goToView(id);
  };

  const isNew = struct === undefined;

  const buildTxParams = () => {
    if (!isValid) return [];

    const json = JSON.stringify(
      { body });

    if (!struct) {
      const update = new CommentUpdate({
        json: new Text(json)
      });
      return [ id, null, update ];
    } else {
      const update = new CommentUpdate({
        json: new Text(json)
      });
      return [ commentId, update ];
    }
  };

  // Todo: Redirect on update and create
  // const goToView = (id: PostId) => {
  //   if (history) {
  //     history.push('/blogs/posts/' + id.toString());
  //   }
  // };

  const form =
    <Form className='ui form JoyForm EditEntityForm'>

      <LabelledField name='body' label='Your comment' {...props}>
        <Field component='textarea' id='body' name='body' disabled={isSubmitting} rows={5} placeholder={`Write your comment here. You can use Markdown.`} />
      </LabelledField>

      <LabelledField {...props}>
        <TxButton
          type='submit'
          size='large'
          label={isNew
            ? `Create a comment`
            : `Update a comment`
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
        <Button
          type='button'
          size='large'
          disabled={!dirty || isSubmitting}
          onClick={() => resetForm()}
          content='Reset form'
        />
      </LabelledField>
    </Form>;

  const sectionTitle = isNew ? `New comment` : `Edit my comment`;

  return <>
    <Section className='EditEntityBox' title={sectionTitle}>
      {form}
    </Section>
  </>;
};

const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { struct } = props;

    if (struct) {
      const { json: { body } } = struct;
      return {
        body
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

function withIdFromUrl (Component: React.ComponentType<OuterProps>) {
  return function (props: UrlHasIdProps) {
    const { match: { params: { id } } } = props;
    try {
      return <Component id={new PostId(id)} />;
    } catch (err) {
      return <em>Invalid post ID: {id}</em>;
    }
  };
}

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
    return <EditForm {...props} struct={struct} commentId={struct.id} />;
  }

  return <Message error className='JoyMainStatus' header='You are not allowed edit this comment.' />;
}

export const NewComment = withMulti(
  EditForm,
  withIdFromUrl
);

export const EditComment = withMulti(
  LoadStruct,
  withIdFromUrl,
  withCalls<OuterProps>(
    queryBlogsToProp('commentById',
      { paramName: 'id', propName: 'structOpt' })
  )
);
