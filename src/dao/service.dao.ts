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
}
