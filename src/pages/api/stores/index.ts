import cors from 'cors';
import nc from 'next-connect';
import { PrismaClient } from '@prisma/client';
import { uploadImage } from '../../../config/multer';
import { NextApiRequest, NextApiResponse } from "next";

interface ExtendedRequest {
  file: any;
}

const prisma = new PrismaClient();

const handler = nc<NextApiRequest, NextApiResponse>().use(cors())
.use(uploadImage.single('image')).post<ExtendedRequest>(async (req, res) => {
  const {
    body,
    file
  } = req;

  try {
    const store = await prisma.store.create({
      data: {
        name: body.name,
        latitude: body.latitude,
        longitude: body.longitude,
        about: body.about,
        opening_hours: body.opening_hours,
        open_on_weekends: body.open_on_weekends,
        whatsapp: body.whatsapp,
        image: `${process.env.AWS_URL + file.key}`,
        }
    });
    res.status(200).json(store)
  } catch(error) {
    return res.status(500).json({error: error.message});
  }
})
.get(async (req, res) => {
  try {
    const stores = await prisma.store.findMany();
    return res.json(stores);
  } catch(error) {
    return res.status(500).json({error: error.message});
  }
})

export const config = {
  api: {
    bodyParser: false
  }
};

export default handler;
