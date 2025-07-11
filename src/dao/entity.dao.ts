import { supabase } from '../config/db';
import { CreateEntityInput, AddMemberInput } from '../interface/entity.interface';

export class EntityDAO {
  static async createEntity({ name, type, ownerId }: CreateEntityInput) {
    const { data, error } = await supabase
      .from('entities')
      .insert({ name, type, owner_id: ownerId })
      .select()
      .single();

    if (error) throw new Error(`Failed to create entity: ${error.message}`);
    return data;
  }

  static async addMember({ entityId, userId, role }: AddMemberInput) {
    const { data, error } = await supabase
      .from('entity_members')
      .insert({
        entity_id: entityId,
        user_id: userId,
        role,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add member: ${error.message}`);
    return data;
  }

  static async getEntitiesByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('owner_id', ownerId);

    if (error) throw new Error(`Failed to fetch entities: ${error.message}`);
    return data;
  }
}
