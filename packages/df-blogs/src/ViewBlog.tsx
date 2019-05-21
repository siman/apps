import React from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'semantic-ui-react';
import ReactMarkdown from 'react-markdown';

import { ApiProps } from '@polkadot/ui-api/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { withCalls } from '@polkadot/ui-api/with';
import { Option } from '@polkadot/types';
import IdentityIcon from '@polkadot/ui-app/IdentityIcon';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { formatNumber } from '@polkadot/util';

import translate from './translate';
import { BlogId, Blog } from './types';
import { queryBlogsToProp } from './utils';
import { nonEmptyStr } from '@polkadot/joy-utils/index';
import { MyAccountProps, withMyAccount } from '@polkadot/joy-utils/MyAccount';

type Props = ApiProps & I18nProps & MyAccountProps & {
  preview?: boolean,
  blogId: BlogId,
  blogById?: Option<any> // TODO refactor to Option<Blog>
};

class Component extends React.PureComponent<Props> {

  render () {
    const { blogById } = this.props;
    if (blogById === undefined) return null;
    else if (blogById.isNone) return <em>Blog not found</em>;
    else return this.renderBlog(blogById.unwrap() as Blog);
  }

  private renderBlog (blog: Blog) {
    const {
      preview = false,
      myAddress
    } = this.props;

    const {
      id,
      created: { account, time, block },
      slug,
      json: { name, desc, image, tags }
    } = blog;

    const isMyBlog = myAddress && account && myAddress === account.toString();
    const hasImage = image && nonEmptyStr(image.toString());

    return (
      <>
      <div className={`item ProfileDetails ${isMyBlog && 'MyProfile'}`}>
        {hasImage
          ? <img className='ui avatar image' src={image.toString()} />
          : <IdentityIcon className='image' value={account} size={40} />
        }
        <div className='content'>
          <div className='header'>
            <Link to={`/blogs/${id}`} className='handle'>{name.toString()}</Link>
            {isMyBlog && <Link to={`/blogs/${id}/edit`} className='ui tiny button'>Edit my blog</Link>}
          </div>
          <div className='description'>
            <ReactMarkdown className='JoyMemo--full' source={desc.toString()} linkTarget='_blank' />
          </div>
        </div>
      </div>

      {!preview &&
        <Table celled selectable compact definition className='ProfileDetailsTable'>
        <Table.Body>
        <Table.Row>
          <Table.Cell>Created on</Table.Cell>
          <Table.Cell>{new Date(time).toLocaleString()} at block #{formatNumber(block)}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Created by</Table.Cell>
          <Table.Cell><AddressMini value={account} isShort={false} isPadded={false} size={36} withName withBalance /></Table.Cell>
        </Table.Row>
        </Table.Body>
        </Table>
      }
      </>
    );
  }
}

export default translate(withMyAccount(
  withCalls<Props>(
    queryBlogsToProp('blogById', 'blogId')
  )(Component)
));
