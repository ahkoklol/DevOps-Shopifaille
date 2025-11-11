import type * as grpc from '@grpc/grpc-js';
import { OrderService } from '../../modules/order-management/services/order.service';

export const ordersHandlers = {
  async GetOrder(call: grpc.ServerUnaryCall<any, any>, cb: grpc.sendUnaryData<any>) {
    try {
      const o = await OrderService.getOrder(call.request.id);
      cb(null, o);
    } catch (e: any) {
      cb({ code: 5, message: 'Not found' } as any); // NOT_FOUND
    }
  }
};
