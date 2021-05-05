import * as Yup from 'yup';
import bcrypt from "bcryptjs";
import userView from '../../../views/user_view';
import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const users = await prisma.user.findMany();
        return res.json(userView.renderMany(users));
      } catch(error) {
        return res.status(500).json({error: error.message});
      }
      break
    case 'POST':
      try {
        const { name, email, password } = req.body;

        const userExist = await prisma.user.findUnique({
          where: {
            email
          }
        }) as User;

        if(userExist) {
          return res.json({ error: "Já existe um usuário com este email." });
        };

        const data = {
          name,
          email,
          password: await bcrypt.hash(password, 8),
          token: '',
        };

        const schema = Yup.object().shape({
          name: Yup.string().required(),
          email: Yup.string().required().email(),
          password: Yup.string().required().min(6),
        });

        await schema.validate(data, { abortEarly: false });

        const user = await prisma.user.create({ data });
        return res.status(200).json(user);
      } catch(error) {
        return res.status(500).json({error: error.message});
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
