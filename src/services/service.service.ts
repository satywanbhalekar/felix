import { ServiceDAO } from '../dao/service.dao';
import { ServiceInput } from '../interface/service.interface';

export class ServiceService {
  static async addService(input: ServiceInput) {
    return await ServiceDAO.addService(input);
  }

  static async updateServicePrice(serviceId: string, price: number) {
    return await ServiceDAO.updateServicePrice(serviceId, price);
  }

  static async bulkAddServices(services: ServiceInput[]) {
    return await ServiceDAO.bulkAddServices(services);
  }
}
