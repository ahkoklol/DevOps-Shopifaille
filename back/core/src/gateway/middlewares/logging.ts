import { FastifyInstance } from 'fastify';

export function registerLogging(app: FastifyInstance) {
  app.addHook('onRequest', async (req) => {
    req.log.info({ method: req.method, url: req.url }, 'incoming');
  });
}
