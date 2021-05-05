import userView from '../../../views/user_view';
import { PrismaClient, User } from "@prisma/client";
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
        const user = await prisma.user.findUnique({
          where: {
            id: String(id)
          }
        }) as User;

        if(!user) {
          return res.status(400).json({ message: 'O usuário não existe.' })
        }
        return res.json(userView.render(user));
      } catch(error) {
        return res.status(500).json({error: error.message});
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
