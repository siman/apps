import { Options } from '@polkadot/ui-api/with/types';
import { queryToProp } from '@polkadot/joy-utils/index';

export const queryBlogsToProp = (storageItem: string, paramNameOrOpts?: string | Options) => {
  return queryToProp(`query.blogs.${storageItem}`, paramNameOrOpts);
};
