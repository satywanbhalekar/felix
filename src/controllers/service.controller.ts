import { Request, Response } from 'express';
import { ServiceService } from '../services/service.service';
import { ServiceInput } from '../interface/service.interface';

export class ServiceController {
  static async addService(req: Request, res: Response) {
    const { entityId, name, description, price, currency } = req.body;

    if (!entityId || !name || price == null) {
       res.status(400).json({ error: 'entityId, name, and price are required' });
    }

    try {
      const service = await ServiceService.addService({ entityId, name, description, price, currency });
      res.status(201).json(service);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updatePrice(req: Request, res: Response) {
    const { serviceId, price } = req.body;

    if (!serviceId || price == null) {
       res.status(400).json({ error: 'serviceId and price are required' });
    }

    try {
      const updated = await ServiceService.updateServicePrice(serviceId, price);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async bulkUpload(req: Request, res: Response) {
    const { services } = req.body;

    if (!Array.isArray(services) || services.length === 0) {
       res.status(400).json({ error: 'services array is required' });
    }

    try {
      const added = await ServiceService.bulkAddServices(services as ServiceInput[]);
      res.status(201).json({ count: added.length, services: added });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
