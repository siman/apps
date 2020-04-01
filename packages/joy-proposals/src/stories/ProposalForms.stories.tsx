import React from 'react';
import '../index.css';
import {EditForm} from '../forms/GenericProposalForm';

export default {
	title: 'Proposals | Forms',
};

const MockGenericProposal = {
  id: 123,
	title: 'Please send me some tokens for coffee',
	description: 'I am a good guy and deserve this reward.'
}

const MockProposalConstraints = {
	title: { min: 3, max: 50 },
	description: { min: 10, max: 1000 }
}

export const DefaultGenericForm = () =>
	<EditForm
		constraints={MockProposalConstraints}
	/>

export const FilledGenericForm = () =>
	<EditForm
		entity={MockGenericProposal}
		constraints={MockProposalConstraints}
	/>
