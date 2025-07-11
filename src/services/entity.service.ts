import { EntityDAO } from '../dao/entity.dao';
import { CreateEntityInput, AddMemberInput } from '../interface/entity.interface';

export class EntityService {
  static async createEntity(input: CreateEntityInput) {
    const entity = await EntityDAO.createEntity(input);

    // Automatically assign owner as a member with ENTITY_OWNER role
    await EntityDAO.addMember({
      entityId: entity.id,
      userId: input.ownerId,
      role: 'ENTITY_OWNER',
    });

    return entity;
  }

  static async addMember(input: AddMemberInput) {
    return await EntityDAO.addMember(input);
  }

  static async getEntitiesByOwner(ownerId: string) {
    return await EntityDAO.getEntitiesByOwner(ownerId);
  }
}
