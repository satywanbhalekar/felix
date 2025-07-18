import { supabase } from '../config/db';
import { EntityDAO } from '../dao/entity.dao';
import { ServiceDAO } from '../dao/service.dao';
import { StellarDAO } from '../dao/stellar.dao';
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
  static async markServiceAsPublic(id: string) {
    return await ServiceDAO.updateServiceVisibility(id, true);
  }

  static async getServicesByEntity(entityId: string) {
    return await ServiceDAO.getServicesByEntityId(entityId);
  }

  static async getAllPublicServices() {
    return await ServiceDAO.getPublicServices();
  }

//   static async buyPublicService(
//     buyerPublicKey: string,
//     buyerSecretKey: string,
//     issuerPublicKey: string,
//     serviceId: string,
//     buyerEntityId: string
//   ) {
//     const publicService = await ServiceDAO.getPublicServiceById(serviceId);
//     if (!publicService) throw new Error('Service not found or not public');

//     const sellerEntity = await EntityDAO.getEntityById(publicService.entity_id);
//     if (!sellerEntity || !sellerEntity.owner_id) throw new Error('Seller entity or owner not found');

//     const { publicKey: sellerPublicKey } = await supabase
//       .from('users')
//       .select('publicKey')
//       .eq('id', sellerEntity.owner_id)
//       .single()
//       .then(({ data, error }) => {
//         if (error) throw new Error(error.message);
//         return data;
//       });

//     //const memoText = `BuyService:${serviceId}:${buyerEntityId}`;
//     //const memoText = 'BuySvc'; 
//     //const memoText = serviceId.slice(0, 28)
//     const memoText = `svc:${serviceId.slice(0, 4)}-${buyerEntityId.slice(0, 4)}`;
//     const xdr = await StellarDAO.createMultisigAssetPaymentXDR(
//       buyerPublicKey,
//       buyerSecretKey,
//       sellerPublicKey,
//       'BLD',
//       issuerPublicKey,
//       publicService.price.toString(),
//       memoText
//     );
// console.log("buyerPublicKey",buyerPublicKey,"buyerSecretKey",buyerSecretKey,"sellerPublicKey",sellerPublicKey,"issuerPublicKey",issuerPublicKey," publicService.price.toString()", publicService.price.toString(), memoText);

//     // Optional: Save XDR to DB if needed for approval tracking
//     return { xdr };
//   }



static async buyPublicService(
  buyerPublicKey: string,
  buyerSecretKey: string,
  issuerPublicKey: string,
  serviceId: string,
  buyerEntityId: string
) {
  // Step 1: Fetch public service
  const publicService = await ServiceDAO.getPublicServiceById(serviceId);
  if (!publicService) throw new Error('Service not found or not public');

  // Step 2: Get seller entity and owner
  const sellerEntity = await EntityDAO.getEntityById(publicService.entity_id);
  if (!sellerEntity || !sellerEntity.owner_id) {
    throw new Error('Seller entity or owner not found');
  }

  // Step 3: Get seller public key
  const { publicKey: sellerPublicKey } = await supabase
    .from('users')
    .select('publicKey')
    .eq('id', sellerEntity.owner_id)
    .single()
    .then(({ data, error }) => {
      if (error) throw new Error(error.message);
      return data;
    });

  // Step 4: Generate memo
  const memoText = `svc:${serviceId.slice(0, 4)}-${buyerEntityId.slice(0, 4)}`;

  // Step 5: Create XDR
  const xdr = await StellarDAO.createMultisigAssetPaymentXDR(
    buyerPublicKey,
    buyerSecretKey,
    sellerPublicKey,
    'BLD',
    issuerPublicKey,
    publicService.price.toString(),
    memoText
  );

  // ✅ Step 6: Save XDR to pending_transactions table
  const { error: insertError } = await supabase.from('pending_transactions').insert({
    sender_public_key: buyerPublicKey,
    receiver_public_key: sellerPublicKey,
    issuer_public_key: issuerPublicKey,
    amount: publicService.price.toString(),
    xdr,
    memo: memoText,
    asset_code: 'BLD',
  });

  if (insertError) {
    console.error('Error saving pending transaction:', insertError.message);
    throw new Error('Failed to store pending transaction');
  }

  console.log("Pending multisig transaction saved for approval.");
  return { xdr };
}



  static async cloneServiceToEntity(serviceId: string, targetEntityId: string) {
    const service = await ServiceDAO.getServiceById(serviceId);
    if (!service) throw new Error('Service not found');
  console.log("serviceId",serviceId,"targetEntityId",targetEntityId);
  
    const cloneData = {
      entity_id: targetEntityId,
      name: service.name,
      description: service.description,
      price: service.price, // Set to 0 or keep original price
      currency: service.currency,
      is_public: false,
    };
  console.log("cloneData",cloneData);
  
    await supabase.from('services').insert([cloneData]);
  }
  
}
