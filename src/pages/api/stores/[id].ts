import { PrismaClient, Store } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const store = await prisma.store.findUnique({
          where: {
            id: String(id)
          }
        }) as Store;

        if(!store) {
          return res.status(400).json({ message: 'A loja não existe.' })
        }
        return res.json(store);
      } catch(error) {
        return res.status(500).json({error: error.message});
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
