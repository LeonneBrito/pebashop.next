import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authConfig from '../../../config/auth';
import userView from '../../../views/user_view';
import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'POST':
      try {
        const {
          email,
          password,
        } = req.body;

        const userExist = await prisma.user.findUnique({
          where: {
            email
          }
        })
        if(!userExist) {
          res.status(400).json({ message: 'Usuário/Senha inválidos.' })
        }

        const passwordMatched =  await bcrypt.compare(password, userExist.password);
        if(!passwordMatched) {
          return res.status(400).json({ message: 'Usuário/Senha inválidos.' })
        }

        const { secret, expiresIn } = authConfig.jwt;
        const token = jwt.sign({}, secret, {
          subject: String(userExist.id),
          expiresIn,
        })

        const user = userView.render(userExist);

        return res.status(200).json({ user, token });
      } catch(error) {
        return res.status(500).json({error: error.message});
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}

