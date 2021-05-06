import { PrismaClient, Store } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
    body,
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
    case 'PUT':
      try {
        const store = await prisma.store.update({
          where: {
            id: String(id)
          },
          data: {
            name: body.name,
            latitude: body.latitude,
            longitude: body.longitude,
            about: body.about,
            opening_hours: body.opening_hours,
            open_on_weekends: body.open_on_weekends,
            whatsapp: body.whatsapp,
            image: body.image,
          }
        })
        return res.json(store);
      } catch(error) {
        return res.status(500).json({error: error.message});
      }
      break
    case 'DELETE':
      try {
        const store = await prisma.store.delete({
          where: {
            id: String(id)
          }
        })
        res.status(204);
      } catch(error) {
        return res.status(500).json({error: error.message});
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
