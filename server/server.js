// import { ApolloServer } from "apollo-server";
import {ApolloServer} from "apollo-server-express"
// import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServerPluginDrainHttpServer,ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled
} from "apollo-server-core";

import typeDefs from "./schemaGql.js";
import jwt from "jsonwebtoken";
// .js using in old version
import mongoose from "mongoose";
// import { MONGO_URI, JWT_SECRET} from "./config.js";
import dotenv from 'dotenv'
import express from 'express';
import http from 'http';
import path from 'path';
const __dirname = path.resolve();

const port = process.env.PORT || 4000;
const app = express();
const httpServer = http.createServer(app);
if(process.env.NODE_ENV !=="production"){
  dotenv.config()
}


mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser:true,
  // useUnifiedTopology:true
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongodb");
});

mongoose.connection.on("error", (err) => {
  console.log("error connecting", err);
});



//import models here
import "./models/User.js";
import "./models/Quotes.js";

import resolvers from "./resolvers.js";

const context = ({ req }) => {
  const { authorization } = req.headers;

  // console.log(authorization, "authorization--1");

  if (authorization) {
    // console.log(authorization, "authorization--2");

    const { userId } = jwt.verify(authorization, process.env.JWT_SECRET);

    //  ( this passs const token = jwt.sign({userId:user._id},JWT_SECRET))
    return { userId };
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  plugins:[
    ApolloServerPluginDrainHttpServer({ httpServer }),
    process.env.NODE_ENV !=="production" ? 
    ApolloServerPluginLandingPageGraphQLPlayground() :
    ApolloServerPluginLandingPageDisabled()
]
 ,
});

// if(process.env.NODE_ENV=="production"){
//   app.use(express.static('client/build'))
//   app.get("*",(req,res)=>{
//       res.sendFile(path.resolve(__dirname,'client','build','index.html'))
//   })
// }



  // app.get("/",(req,res)=>{
  //     res.send("bomm")
  // })

  if(process.env.NODE_ENV=="production"){
    app.use(express.static('client/build'))
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })
}

await server.start();
server.applyMiddleware({
     app,
     path:'/graphql' 
});

httpServer.listen({port},()=>{
  console.log(`🚀 Server BBBBB ====>  4000 ${server.graphqlPath}`);
})
