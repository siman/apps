import { Option, Struct } from '@polkadot/types/codec';
import { getTypeRegistry, BlockNumber, Moment, AccountId, u64, Text, Vector } from '@polkadot/types';

export class BlogId extends u64 {}
export class PostId extends u64 {}
export class CommentId extends u64 {}

export type ChangeType = {
  owner: AccountId,
  block: BlockNumber,
  time: Moment
};

export class Change extends Struct {
  constructor (value?: ChangeType) {
    super({
      owner: AccountId,
      block: BlockNumber,
      time: Moment
    }, value);
  }

  get owner (): AccountId {
    return this.get('owner') as AccountId;
  }

  get block (): BlockNumber {
    return this.get('block') as BlockNumber;
  }

  get time (): Moment {
    return this.get('time') as Moment;
  }
}

export class VecAccountId extends Vector.with(AccountId) {}

export class OptionText extends Option.with(Text) {}
export class OptionChange extends Option.with(Change) {}
export class OptionBlogId extends Option.with(BlogId) {}
export class OptionPostId extends Option.with(PostId) {}
export class OptionCommentId extends Option.with(CommentId) {}
export class OptionVecAccountId extends Option.with(VecAccountId) {}

export type BlogData = {
  name: string,
  desc: string,
  image: string,
  tags: string[]
};

export type BlogType = {
  id: BlogId,
  created: ChangeType,
  updated: OptionChange,
  writers: AccountId[],
  slug: Text,
  json: Text
};

export class Blog extends Struct {
  constructor (value?: BlogType) {
    super({
      id: BlogId,
      created: Change,
      updated: OptionChange,
      writers: VecAccountId,
      slug: Text,
      json: Text
    }, value);
  }

  get id (): BlogId {
    return this.get('id') as BlogId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get writers (): VecAccountId {
    return this.get('writers') as VecAccountId;
  }

  get slug (): Text {
    return this.get('slug') as Text;
  }

  get json (): BlogData {
    const json = this.get('json') as Text;
    return JSON.parse(json.toString());
  }
}

export type BlogUpdateType = {
  blog_id: OptionBlogId,
  writers: OptionVecAccountId,
  slug: OptionText,
  json: OptionText
};

export class BlogUpdate extends Struct {
  constructor (value?: BlogUpdateType) {
    super({
      blog_id: OptionBlogId,
      writers: OptionVecAccountId,
      slug: OptionText,
      json: OptionText
    }, value);
  }
}

export type PostData = {
  title: string,
  body: string,
  image: string,
  tags: string[]
};

export type PostType = {
  id: PostId,
  blog_id: BlogId,
  created: ChangeType,
  updated: OptionChange,
  slug: Text,
  json: Text
};

export class Post extends Struct {
  constructor (value?: PostType) {
    super({
      id: PostId,
      blog_id: BlogId,
      created: Change,
      updated: OptionChange,
      slug: Text,
      json: Text
    }, value);
  }

  get id (): PostId {
    return this.get('id') as PostId;
  }

  get blog_id (): BlogId {
    return this.get('blog_id') as BlogId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get slug (): Text {
    return this.get('slug') as Text;
  }

  get json (): PostData {
    const json = this.get('json') as Text;
    return JSON.parse(json.toString());
  }
}

export type PostUpdateType = {
  blog_id: OptionBlogId,
  post_id: OptionPostId,
  slug: OptionText,
  json: OptionText
};

export class PostUpdate extends Struct {
  constructor (value?: PostUpdateType) {
    super({
      blog_id: OptionBlogId,
      post_id: OptionPostId,
      slug: OptionText,
      json: OptionText
    }, value);
  }
}

export type CommentType = {
  id: CommentId,
  parent_id: OptionCommentId,
  post_id: PostId,
  blog_id: BlogId,
  created: ChangeType,
  updated: OptionChange,
  json: Text
};

export class Comment extends Struct {
  constructor (value?: CommentType) {
    super({
      id: CommentId,
      parent_id: OptionCommentId,
      post_id: PostId,
      blog_id: BlogId,
      created: Change,
      updated: OptionChange,
      json: Text
    }, value);
  }
}

export type CommentUpdateType = {
  json: OptionText
};

export class CommentUpdate extends Struct {
  constructor (value?: CommentUpdateType) {
    super({
      json: OptionText
    }, value);
  }
}

export function registerBlogsTypes () {
  try {
    const typeRegistry = getTypeRegistry();
    typeRegistry.register({
      BlogId,
      PostId,
      CommentId,
      Change,
      Blog,
      BlogUpdate,
      Post,
      PostUpdate,
      Comment,
      CommentUpdate
    });
  } catch (err) {
    console.error('Failed to register custom types of blogs module', err);
  }
}
