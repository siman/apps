import BN from 'bn.js';
import {ValidationConstraint} from '@polkadot/joy-utils/ValidationConstraint';

export type ProposalId = BN

export type ProposalValidationConstraints = {
  title: ValidationConstraint
  description: ValidationConstraint
}

export type ProposalFormValues = {
  title: string
  description: string
};

export type ProposalType = {
  id: number
  title: string
  description: string
};

// export class ProposalCodec {
//   static fromSubstrate(id: ProposalId, sub: Proposal): ProposalType {
//     return {
//       id: id.toNumber(),
//       title: sub.getString('title'),
//       description: sub.getString('description'),
//     }
//   }
// }

export function ProposalToFormValues(entity?: ProposalType): ProposalFormValues {
  return {
    title: (entity && entity.title) || '',
    description: (entity && entity.description) || '',
  }
}

export type ProposalPropId =
  'title' |
  'description'

// TODO Extract EasyGenericProp<PropId -> id: PropId>
export type ProposalGenericProp = {
  id: ProposalPropId,
  name: string,
  description?: string,
  required?: boolean,
}

type ProposalFieldsType = {
  [id in ProposalPropId]: ProposalGenericProp
}

export const ProposalFields: ProposalFieldsType = {
  title: {
    id: 'title',
    name: 'Title',
    description: 'Title of your proposal.',
    required: true,
  },
  description: {
    id: 'description',
    name: 'Description',
    description: 'Full description of your proposal.',
    required: true,
  },
}
