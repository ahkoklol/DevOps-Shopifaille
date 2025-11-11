import { FastifyInstance } from 'fastify';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err, _req, reply) => {
    app.log.error(err);
    reply.code( err.statusCode ?? 500 ).send({ message: err.message ?? 'Internal Server Error' });
  });
}
