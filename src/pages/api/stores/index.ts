import cors from 'cors';
import aws, { ServiceCatalogAppRegistry } from 'aws-sdk';
import multer from 'multer';
import crypto from 'crypto';
import nc from 'next-connect';
import multerS3 from 'multer-s3';
import getConfig from 'next/config'
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from "next";

interface ExtendedRequest {
  file: any;
}

const prisma = new PrismaClient();

const uploadImage = multer({
  storage: multerS3({
    s3: new aws.S3(),
    bucket: process.env.BUCKET_NAME || "",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);
        const fileName = `${hash.toString("hex")}-${file.originalname}`
        cb(null, fileName);
      });
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (req, file, cb: any) => {
    const allowedMimes = [
      "image/jpeg",
      "image/pjpeg",
      "image/png",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  }
});

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
