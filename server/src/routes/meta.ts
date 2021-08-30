import { Express } from 'express';
import Meta from '../models/MetaSchema';
import { Meta as MetaType } from '../models/MetaSchema/types';
import * as cheerio from 'cheerio';
import validUrl from 'valid-url';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import { requireSignIn } from '../utils/middleware';
// import puppeteer from "puppeteer"

// const usePuppeteer = async (url:string) => {
//   const browser = await puppeteer.launch({
//     headless:true
//   })
//   const page = await browser.newPage();
//   await page.goto(url)
//   const data = await page.evaluate(() => {

//   })
// }

const scrapMetaTags = async (url: string) => {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const meta = $('meta').toArray();
    const metaResult: any[] = [];
    meta.map(item => {
      metaResult.push({ ...item.attribs });
    });
    return {
      url,
      meta: metaResult,
    };
  } catch (err) {
    console.log('error in scraping data', { err });
  }
};

export default (app: Express) => {
  app.get<
    {},
    {},
    {
      url: string;
    }
  >('/get-meta', requireSignIn, async (req, res) => {
    try {
      if (!validUrl.isUri(req.body.url)) {
        return res.status(400).json({
          message: 'The url is not valid',
        });
      }
      const scrappedData = await scrapMetaTags(req.body.url);
      if (!scrappedData) {
        return res.status(200).json({
          message: 'No meta was found',
        });
      }
      let id: string;
      let data;
      const foundMeta = await Meta.findOne({ url: req.body.url });
      const date = new Date().toJSON();
      if (foundMeta && scrappedData.meta) {
        foundMeta.meta = [
          ...(foundMeta.meta as any),
          {
            date,
            meta: scrappedData.meta,
          },
        ];
        await foundMeta.save();
        data = foundMeta;
        id = foundMeta.id;
      } else {
        const { url, meta, title, favicon } = scrappedData as any;
        const savedData = new Meta({
          url,
          meta: [
            {
              date,
              meta,
            },
          ],
          title,
          favicon,
        });
        await savedData.save();
        data = savedData;
        id = savedData.id;
      }
      return res.status(200).json({
        id,
        data: scrappedData,
        message: 'Successfully saved meta',
        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
      });
    } catch (err) {
      if (err.code == 11000) {
        return res.status(401).json({
          message: 'Error This username is already taken',
        });
      }
      console.log({ err });
      return res.status(401).json({
        message: 'Something Went Wrong :(',
        error: err.message || err,
      });
    }
  });

  app.get<
    {
      metaId: string;
    },
    {},
    {}
  >('/get-meta/:metaId', requireSignIn, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params['metaId'])) {
      return res.status(400).json({
        message: 'meta id is not valid',
      });
    }
    try {
      const foundMeta = await Meta.findById(req.params['metaId']);
      if (foundMeta) {
        return res.status(200).json({
          message: 'Query successful',
          data: foundMeta,
        });
      } else {
        return res.status(200).json({
          message: 'Unable to find meta with given id',
          data: [],
        });
      }
    } catch (err) {
      if (err.code == 11000) {
        return res.status(401).json({
          message: 'Error This username is already taken',
        });
      }
      res.status(401).json({
        message: 'Something Went Wrong :(',
        error: err.message || err,
      });
    }
  });

  app.post<{}, {}, MetaType>('/post-meta/', requireSignIn, async (req, res) => {
    try {
      console.log({ body: req.body });
      if (!validUrl.isUri(req.body.url)) {
        return res.status(400).json({
          message: 'The url is not valid',
        });
      }
      const date = new Date().toJSON();
      const newMeta = {
        url: req.body.url,
        meta: [
          {
            date,
            meta: req.body.meta,
          },
        ],
      };
      const savedMeta = new Meta(newMeta);
      await savedMeta.save();
      return res.status(200).json({
        data: savedMeta,
        message: 'Successfully saved meta',
        id: savedMeta.id,
      });
    } catch (err) {
      if (err.code == 11000) {
        return res.status(401).json({
          message: 'Error This username is already taken',
        });
      }
      res.status(401).json({
        message: 'Something Went Wrong :(',
      });
    }
  });
};
