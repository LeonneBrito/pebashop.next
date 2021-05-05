import bcrypt from 'bcryptjs';
import path from "path";
import getConfig from 'next/config'
import AppError from '../../../errors/AppError';
import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from 'next';
import SendMailService from '../../../services/SendMailServices';

const prisma = new PrismaClient()
const { serverRuntimeConfig } = getConfig();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'POST':
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          email
        }
      });

      if (!user) {
        throw new AppError('O usuário não existe');
      }

      const token = await bcrypt.hash(user.id + String(Math.random()), 8);

      await prisma.user.update({
        where: {
          email
        },
        data: {
          token
        }
      });

      const npsPath = path.join(serverRuntimeConfig.PROJECT_ROOT, './src/resources/emails/forgotPass.hbs')

      const variables = {
        name: user.name,
        token,
        link: process.env.API_URL,
      };

      await SendMailService.execute(email, 'Resetando a senha! 🔒', variables, npsPath);
      return res.status(200).json({ message: 'O e-mail de redefinição de senha foi enviado.' });

    } catch(error) {
      return res.status(500).json({error: error.message});
    }
    break
    default:
      res.status(400).json({ success: false })
      break
  }
}
