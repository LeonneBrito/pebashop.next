import bcrypt from 'bcryptjs';
import AppError from '../../../errors/AppError';
import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'POST':
    try {
      const { password, token } = req.body;

      const user =  await prisma.user.findUnique({
        where: {
          token
        }
      })

      if(!user) {
        throw new AppError('Não existe token para esse usuário.');
      }

      const passwordHashed = await bcrypt.hash(password, 8);

      await prisma.user.update({
        where: {
          token
        },
        data: {
          password: passwordHashed
        }
      })
      return res.status(200).json({ message: 'A senha foi atualizada com sucesso.' });

    } catch(error) {
      return res.status(500).json({error: error.message});
    }
    break
    default:
      res.status(400).json({ success: false })
      break
  }
}
