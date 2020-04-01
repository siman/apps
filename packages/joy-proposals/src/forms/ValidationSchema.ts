import * as Yup from 'yup';
import {ProposalFields, ProposalGenericProp, ProposalValidationConstraints} from './ProposalTypes';

export const buildValidationSchema = (constraints: ProposalValidationConstraints) => {

  function textValidation (field: ProposalGenericProp) {
    const constraint = constraints[field.id]
    if (!constraint) {
      return Yup.string()
    }

    const { min, max } = constraint
    return Yup.string()
      .min(min, `${field.name} is too short. Minimum length is ${min} chars.`)
      .max(max, `${field.name} is too long. Maximum length is ${max} chars.`)
  }

  const fields = ProposalFields

  return Yup.object().shape({
    title:
      textValidation(fields.title)
        .required(`${fields.title.name} is required`),
    description:
      textValidation(fields.description)
        .required(`${fields.description.name} is required`),
  });
}
