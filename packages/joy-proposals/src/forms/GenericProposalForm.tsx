import React from 'react';
import {Button} from 'semantic-ui-react';
import {Form, withFormik} from 'formik';
import {History} from 'history';
import BN from 'bn.js';

import {EasyFormProps, withEasyForm} from '@polkadot/joy-utils/JoyEasyForms';
import TxButton from '@polkadot/joy-utils/TxButton';
import {findFirstParamOfSubstrateEvent} from '@polkadot/joy-utils/index';
import {TxCallback} from '@polkadot/react-components/Status/types';
import {SubmittableResult} from '@polkadot/api';
import {
  ProposalFields as Fields,
  ProposalFormValues,
  ProposalId,
  ProposalToFormValues,
  ProposalType,
  ProposalValidationConstraints
} from './ProposalTypes';
import {buildValidationSchema} from '@polkadot/joy-proposals/forms/ValidationSchema';
import Section from '@polkadot/joy-utils/Section';

type FormValues = ProposalFormValues;

export type OuterProps = {
  history?: History
  id?: ProposalId
  entity?: ProposalType
  constraints?: ProposalValidationConstraints
}

const InnerForm = (props: EasyFormProps<OuterProps, FormValues>) => {
  const {
    // React components for form fields:
    EasyText,
    // EasyDropdown,
    LabelledField,

    // Callbacks:
    onSubmit,
    // onTxSuccess,
    onTxFailed,

    history,
    id: existingId,
    entity,
    // isFieldChanged,

    // Formik stuff:
    // values,
    dirty,
    isValid,
    isSubmitting,
    setSubmitting,
    resetForm
  } = props;

  // const { myAddress, myMemberId } = useMyMembership();
  const isNew = !entity;

  const onTxSuccess: TxCallback = (txResult: SubmittableResult) => {
    setSubmitting(false)
    if (!history) return

    const id = existingId
      ? existingId
      : findFirstParamOfSubstrateEvent<BN>(txResult, 'ProposalCreated')

    console.log('Proposals id:', id?.toString())

    if (id) {
      history.push('/proposals/' + id.toString())
    }
  }

  const buildTxParams = () => {
    if (!isValid) return [];

    return [ /* TODO provide params for tx */ ];
  }

  const formFields = () => <>
    {/* TODO Add proposal type */}
    <EasyText field={Fields.title} {...props} />
    <EasyText field={Fields.description} textarea {...props} />
  </>;

  // @ts-ignore
  const renderMainButton = () =>
    <TxButton
      type='submit'
      size='large'
      isDisabled={!dirty || isSubmitting}
      label={isNew
        ? 'Create proposal'
        : 'Update proposal'
      }
      params={buildTxParams()}
      tx={isNew
        ? 'proposals.createProposal'
        : 'proposals.updateProposal'
      }
      onClick={onSubmit}
      txFailedCb={onTxFailed}
      txSuccessCb={onTxSuccess}
    />

  return <Section title={`Create Proposal`}>
    <Form className='ui form JoyForm ProposalForm'>

      {formFields()}

      <LabelledField style={{ marginTop: '1rem' }} {...props}>
        {/*{renderMainButton()}*/}

        <Button
          type='button'
          primary
          disabled={!dirty || isSubmitting}
          onClick={() => alert('Not implemented yet :(')}
          content='Submit'
        />

        <Button
          type='button'
          disabled={!dirty || isSubmitting}
          onClick={() => resetForm()}
          content='Reset form'
        />
      </LabelledField>
    </Form>
  </Section>;
};

export const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    return ProposalToFormValues(props.entity);
  },

  validationSchema: (props: OuterProps): any => {
    const { constraints } = props
    if (!constraints) return null

    return buildValidationSchema(constraints)
  },

  handleSubmit: () => {
    // do submitting things
  }
})(withEasyForm(InnerForm) as any);

export default EditForm;
