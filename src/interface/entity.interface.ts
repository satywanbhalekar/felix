export type EntityType = 'COE_DESK' | 'PROJECT';
export type UserRole = 'ADMIN' | 'ENTITY_OWNER' | 'MEMBER' | 'OBSERVER';

export interface CreateEntityInput {
  name: string;
  type: EntityType;
  ownerId: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  ownerId: string;
  createdAt: string;
}

export interface AddMemberInput {
  entityId: string;
  userId: string;
  role: UserRole;
}
