import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

// export const createUser = async (req: Request, res: Response) => {
//   try {
//     await UserService.createUser(req.params.realm, req.body);
//     res.status(201).json({ message: 'User created' });
//   } catch (err: any) {
//     console.log("err?.response?.status || 500).json({ error: err?.message }",err.data.errorMessage);
    
//     res.status(err?.response?.status || 500).json({ error: err.message });
//   }
// };
export const createUser = async (req: Request, res: Response) => {
  try {
    await UserService.createUser(req.params.realm, req.body);
    res.status(201).json({ message: 'User created' });
  } catch (err: any) {
    // Log the full error for debugging
   // console.error('[Controller:createUser] Error:', err?.response?.data || err?.data || err.message);
    // Extract a safe error message
    const errorMessage =
      err?.response?.data?.errorMessage || err?.data?.errorMessage || err?.message || 'Unknown error';

    res.status(err?.response?.status || 500).json({ error: errorMessage });
  }
};


export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getUsers(req.params.realm);
    res.json(users);
  } catch (err: any) {
    res.status(err?.response?.status || 500).json({ error: err?.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    await UserService.updateUser(req.params.realm, req.params.userId, req.body);
    res.json({ message: 'User updated' });
  } catch (err: any) {
    res.status(err?.response?.status || 500).json({ error: err?.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await UserService.deleteUser(req.params.realm, req.params.userId);
    res.json({ message: 'User deleted' });
  } catch (err: any) {
    res.status(err?.response?.status || 500).json({ error: err?.message });
  }
};
