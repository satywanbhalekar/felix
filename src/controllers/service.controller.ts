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

  static async markServiceAsPublic(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const updated = await ServiceService.markServiceAsPublic(id);
      res.status(200).json({ message: 'Service marked as public', service: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getServicesByEntityId(req: Request, res: Response) {
    const { entityId } = req.params;
    try {
      const services = await ServiceService.getServicesByEntity(entityId);
      res.status(200).json({ services });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAllPublicServices(req: Request, res: Response) {
    try {
      const services = await ServiceService.getAllPublicServices();
      res.status(200).json({ services });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async buyPublicService(req: Request, res: Response) {
    const {
      buyerPublicKey,
      buyerSecretKey,
      issuerPublicKey,
      serviceId,
      buyerEntityId,
    } = req.body;

    if (!buyerPublicKey || !buyerSecretKey || !issuerPublicKey || !serviceId || !buyerEntityId) {
       res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const result = await ServiceService.buyPublicService(
        buyerPublicKey,
        buyerSecretKey,
        issuerPublicKey,
        serviceId,
        buyerEntityId
      );

      res.status(200).json({
        message: 'Multisig initiated. Service will be added upon approval.',
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
