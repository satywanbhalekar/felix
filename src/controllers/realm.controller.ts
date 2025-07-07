import { Request, Response } from 'express';
import { RealmService } from '../services/realm.service';

// export const createRealm = async (req: Request, res: Response) => {
//   try {
//     await RealmService.createRealm(req.body);
//     res.status(201).json({ message: 'Realm created successfully' });
//   } catch (err: any) {
//     res.status(err?.response?.status || 500).json({
//       error: err?.response?.data?.error || err.message,
//     });
//   }
  
// };

export const createRealm = async (req: Request, res: Response) => {
  try {
    const { tenantName, admin } = req.body;
    
    if (!tenantName || !admin || !admin.email || !admin.firstName || !admin.lastName) {
       res.status(400).json({ 
        error: 'tenantName and complete admin details (firstName, lastName, email) are required.' 
      });
    }

    // Pass admin details along with tenantName to the service.
    const result = await RealmService.createRealm(req.body);

    res.status(201).json({
      message: 'Realm created successfully',
      credentials: result,
    });
  } catch (err: any) {
    console.error('[Controller:createRealm] Error:', err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({
      error: err?.response?.data?.error || err.message,
    });
  }
};


export const getAllRealms = async (req: Request, res: Response) => {
  try {
    const realms = await RealmService.getAllRealms();
    res.status(200).json({ realms });
  } catch (err: any) {
    res.status(err?.response?.status || 500).json({
      error: err?.response?.data?.error || err.message,
    });
  }
};


export const deleteRealm = async (req: Request, res: Response) => {
    try {
      const { realmName } = req.params;
      await RealmService.deleteRealm(realmName);
      res.status(200).json({ message: `Realm '${realmName}' deleted successfully` });
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({
        error: err?.response?.data?.error || err.message,
      });
    }
  };
  
