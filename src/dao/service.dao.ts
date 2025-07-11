import { supabase } from '../config/db';
import { ServiceInput } from '../interface/service.interface';

export class ServiceDAO {
  static async addService(input: ServiceInput) {
    const { data, error } = await supabase
      .from('services')
      .insert({
        entity_id: input.entityId,
        name: input.name,
        description: input.description || '',
        price: input.price,
        currency: input.currency || 'BD',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add service: ${error.message}`);
    return data;
  }

  static async updateServicePrice(serviceId: string, price: number) {
    const { data, error } = await supabase
      .from('services')
      .update({ price })
      .eq('id', serviceId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update service: ${error.message}`);
    return data;
  }

  static async bulkAddServices(services: ServiceInput[]) {
    const { data, error } = await supabase
      .from('services')
      .insert(
        services.map(service => ({
          entity_id: service.entityId,
          name: service.name,
          description: service.description || '',
          price: service.price,
          currency: service.currency || 'BD',
        }))
      )
      .select();

    if (error) throw new Error(`Failed to bulk add services: ${error.message}`);
    return data;
  }

  static async updateServiceVisibility(id: string, isPublic: boolean) {
    const { data, error } = await supabase
      .from('services')
      .update({ is_public: isPublic })
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async getServicesByEntityId(entityId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('entity_id', entityId);

    if (error) throw new Error(error.message);
    return data;
  }

  // Fetch all public services
  static async getPublicServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_public', true);

    if (error) throw new Error(error.message);
    return data;
  }


  static async getPublicServiceById(id: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('is_public', true)
      .single();

    if (error) return null;
    return data;
  }
  static async findPublicServiceByPrefix(prefix: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('short_id', prefix)
      .eq('is_public', true)
      .limit(1)
      .maybeSingle();
  
    if (error || !data) return error;
    console.log("data",data);
    
    return data;
  }
  
  static async getServiceById(id: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
  
    if (error) return null;
    return data;
  }
  
}
