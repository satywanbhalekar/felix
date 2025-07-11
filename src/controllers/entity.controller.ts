import { Request, Response } from 'express';
import { EntityService } from '../services/entity.service';

export class EntityController {
  static async createEntity(req: Request, res: Response) {
    const { name, type, ownerId } = req.body;

    if (!name || !type || !ownerId) {
       res.status(400).json({ error: 'name, type, and ownerId are required' });
    }

    try {
      const entity = await EntityService.createEntity({ name, type, ownerId });
      res.status(201).json(entity);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async addMember(req: Request, res: Response) {
    const { entityId, userId, role } = req.body;

    if (!entityId || !userId || !role) {
       res.status(400).json({ error: 'entityId, userId, and role are required' });
    }

    try {
      const member = await EntityService.addMember({ entityId, userId, role });
      res.status(201).json(member);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getEntitiesByOwner(req: Request, res: Response) {
    const { ownerId } = req.params;

    if (!ownerId) {
       res.status(400).json({ error: 'ownerId is required' });
    }

    try {
      const entities = await EntityService.getEntitiesByOwner(ownerId);
      res.status(200).json(entities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
