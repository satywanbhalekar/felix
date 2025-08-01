
import { supabase } from '../config/db';
import { User } from '../interface/index.interface';

export class UserDAO {
  static async saveUser(username: string, publicKey: string, secretKey: string) {
    console.log("dao ",username, publicKey, secretKey);
    
    const { error } = await supabase
      .from('users')
      .insert([{ username, publicKey, secretKey }]);

    if (error) {
      console.error('Supabase insert error:', error.message);
      throw new Error('Failed to store user in Supabase');
    }
  }

  static async getAllUsers(): Promise<User[] | null> {
    const { data, error } = await supabase.from('users').select('*');

    if (error) {
      console.error('Error fetching users:', error.message);
      return null;
    }

    return data;
  }
}
