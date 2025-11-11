import type * as grpc from '@grpc/grpc-js';
import { StoreService as Domain } from '../../modules/store-management/services/store.service.ts';

export const storeHandlers = {
  async GetStore(call: grpc.ServerUnaryCall<any, any>, cb: grpc.sendUnaryData<any>) {
    const s = await Domain.getStore(call.request.id);
    if (!s) return cb({ code: 5, message: 'Not found' } as any); // NOT_FOUND
    cb(null, s);
  },
  async ListCategories(call: grpc.ServerUnaryCall<any, any>, cb: grpc.sendUnaryData<any>) {
    const items = await Domain.listCategories(call.request.store_id);
    cb(null, { items });
  }
};
