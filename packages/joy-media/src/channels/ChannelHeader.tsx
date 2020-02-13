import React from 'react';
import { BgImg } from '../common/BgImg';
import { ChannelEntity } from '../entities/ChannelEntity';
import { ChannelPreview } from './ChannelPreview';
import { ChannelToFormValues } from '../schemas/channel/Channel';

type Props = {
  channel: ChannelEntity
}

export function ChannelHeader (props: Props) {
  const { channel } = props;
  const channelFormValues = ChannelToFormValues(channel);
  return (
    <div className='ChannelHeader'>
      <BgImg className='ChannelCover' url={channelFormValues.banner} />
      <ChannelPreview channel={channel} size='big' />
    </div>
  );
}
