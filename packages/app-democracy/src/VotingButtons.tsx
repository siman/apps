// Copyright 2017-2019 @polkadot/app-democracy authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { QueueTx$ExtrinsicAdd } from '@polkadot/ui-app/Status/types';
import { ApiProps } from '@polkadot/ui-api/types';

import BN from 'bn.js';
import React from 'react';
import { Button } from '@polkadot/ui-app/index';
import { withApi, withMulti } from '@polkadot/ui-api/index';

import translate from './translate';

type Props = ApiProps & I18nProps & {
  accountId?: string,
  queueExtrinsic: QueueTx$ExtrinsicAdd,
  referendumId: BN
};

class VotingButton extends React.PureComponent<Props> {
  render () {
    const { accountId, t } = this.props;

    return (
      <Button.Group>
        <Button
          isDisabled={!accountId}
          isNegative
          label={t('Nay')}
          onClick={this.onClickNo}
        />
        <Button.Or />
        <Button
          isDisabled={!accountId}
          isPositive
          label={t('Aye')}
          onClick={this.onClickYes}
        />
      </Button.Group>
    );
  }

  private doVote (vote: boolean) {
    const { accountId, api, queueExtrinsic, referendumId } = this.props;

    if (!accountId) {
      return;
    }

    queueExtrinsic({
      extrinsic: api.tx.democracy.vote(referendumId, vote ? -1 : 0),
      accountId
    });
  }

  private onClickYes = () => {
    this.doVote(true);
  }

  private onClickNo = () => {
    this.doVote(false);
  }
}

export default withMulti(
  VotingButton,
  translate,
  withApi
);
