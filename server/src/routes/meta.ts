import {Express} from "express";
import Meta from "../models/MetaSchema"
import {Meta as MetaType} from "../models/MetaSchema/types"
import * as cheerio from "cheerio"
import getUrls from "get-urls"
import fetch from "node-fetch"
import mongoose from "mongoose";

const scrapMetaTags = (text:string) => {
  const urls = Array.from(getUrls(text))
  const request = urls.map(async url => {
    try{
      const res = await fetch(url)
      const html = await res.text()
      const $ = cheerio.load(html);
      const meta = $("meta").toArray()
      const metaResult:any[] = []
      meta.map((item) => {
        metaResult.push({...item.attribs})
      })
      return({
        url,
        meta:metaResult,
        title:$('title').first().text(),
        favicon:$('link[rel="shortcut icon"]').attr('href')
      })
    }catch(err){
      console.log("error in scraping data",{err})
    }
  })
  return Promise.all(request)
}


export default (app:Express) => {
    app.get<{},{},{
      text:string
    }>(
        "/get-meta",
        async (req,res) => {
            try{
              const scrappedData = await scrapMetaTags(req.body.text)
              if(scrappedData){
                const savedData = new Meta(scrappedData[0])
                await savedData.save()
                return res.status(200).json({
                  data:scrappedData,
                  message:"Successfully saved meta",
                  id:savedData.id
                })
              }else {
                return res.status(200).json({
                  message:"No meta was found"
                })
              }
            }catch(err){
              console.log("there's been an err ",{err})
                if (err.code == 11000) {
                    return res.status(401).json({
                      message: 'Error This username is already taken',
                    });
                  }
                  res.status(401).json({
                    message: 'Something Went Wrong :(',
                    error:err.message || err
                  });
            }
        }
    )
    app.get<{
      "metaId":string
    },{},{}>(
        "/get-meta/:metaId",
        async (req,res) => {
          if(!mongoose.isValidObjectId(req.params["metaId"])){
            return res.status(400).json({
              message:"meta id is not valid"
            })
          }
            try{
              const foundMeta = await Meta.findById(req.params["metaId"])
              console.log("This is the found meta",{foundMeta})
              if(foundMeta){
                return res.status(200).json({
                  message:"Query successful",
                  data:foundMeta
                })
              }else{
                return res.status(200).json({
                  message:"Unable to find meta with given id",
                  data:[]
                })
              }
            }catch(err){
                if (err.code == 11000) {
                    return res.status(401).json({
                      message: 'Error This username is already taken',
                    });
                  }
                  res.status(401).json({
                    message: 'Something Went Wrong :(',
                    error:err.message || err
                  });
            }
        }
    )
    app.post<{},{},MetaType>(
        "/post-meta/",
        async (req,res) => {
            try{
              const newMeta = {
                url:req.body.url,
                favicon:req.body.favicon,
                title:req.body.title,
                meta:req.body.meta
              }
              const savedMeta = new Meta(newMeta)
              await savedMeta.save()
              return res.status(200).json({
                  data:savedMeta,
                  message:"Successfully saved meta",
                  id:savedMeta.id
                })
            }catch(err){
                if (err.code == 11000) {
                    return res.status(401).json({
                      message: 'Error This username is already taken',
                    });
                  }
                  res.status(401).json({
                    message: 'Something Went Wrong :(',
                  });
            }
        }
    )
}
