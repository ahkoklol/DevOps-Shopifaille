import * as grpc from '@grpc/grpc-js';
import * as loader from '@grpc/proto-loader';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.ts';
import { storeHandlers } from './handlers/store.handler.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.join(__dirname, 'protos', 'store.proto');

export function startGrpcServer() {
  const pkgDef = loader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
  const proto = (grpc.loadPackageDefinition(pkgDef) as any).core.store.v1;

  const server = new grpc.Server();
  server.addService(proto.StoreService.service, storeHandlers);

  const addr = `0.0.0.0:${env.grpcPort}`;
  server.bindAsync(addr, grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('[gRPC] listening', addr);
  });
  return server;
}
