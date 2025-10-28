export enum WorkspaceVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum MemberStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  REJECT = 'reject',
}

export enum MemberType {
  NORMAL = 'normal',
  INVITE = 'invite',
  REQUEST_JOIN = 'request_join',
}