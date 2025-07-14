import { supabase } from '../config/db';
import { CreateEntityInput, AddMemberInput } from '../interface/entity.interface';
import { User } from '../interface/index.interface';

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
  static async getEntityById(id: string) {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
  static async findEntityByPrefix(prefix: string) {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('short_id', prefix)
      .limit(1)
      .maybeSingle();
  
    if (error || !data) return null;
    return data;
  }


  static async getUserSummary(userId: string) {
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) return null;

    // Get entities owned by user
    const { data: ownedEntities, error: ownedError } = await supabase
      .from('entities')
      .select('*')
      .eq('owner_id', userId);

    if (ownedError) return null;

    // Get memberships
    const { data: memberships, error: memberError } = await supabase
      .from('entity_members')
      .select('*, entity:entity_id(*)')
      .eq('user_id', userId);

    if (memberError) return null;

    // Get services in owned entities
    const ownedEntityIds = ownedEntities.map(e => e.id);
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .in('entity_id', ownedEntityIds);

    if (servicesError) return null;

    return {
      user,
      ownedEntities,
      memberships,
      services,
    };
  }
  

  static async getUsersByUsername(username: string): Promise<User[] | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', `%${username}%`); // case-insensitive partial match

    if (error) throw new Error(error.message);
    return data;
  }

}
