import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import { JWT_SECRET } from "./config.js";

const User = mongoose.model("User");
const Quote = mongoose.model("Quote");

const resolvers = {
  Query: {
    users: async() =>await User.find({}),
    user: async(_, { _id }) =>await User.findOne({_id}),
    quotes:async () => await Quote.find({}).populate("by","_id firstName"),
    iquote: async(_, {by}) =>await Quote.find({by}),
    myprofile: async(_, args,{userId}) =>await User.findOne({_id:userId}),
  },
  User: {
     quotes: async(ur) =>await Quote.find({by:ur._id}),
  },

  Mutation: {
    signupUser: async (_, { userNew }) => {
      const user = await User.findOne({ email: userNew.email });
      // if not put await then show ( "message": "User already exists that email",)

      if (user) {
        throw new Error("User already exists that email");
      }

      const hashedPassword = await bcrypt.hash(userNew.password, 12);

      const newUser = new User({
        ...userNew,
        password: hashedPassword,
      });

      return await newUser.save();
    },

    signinUser: async (_, { userSignin }) => {
      const user = await User.findOne({ email: userSignin.email });

      if (!user) {
        throw new Error("User dosent exist with that email--Please sign up.");
      }
      const doMatch = await bcrypt.compare(userSignin.password, user.password);
      if (!doMatch) {
        throw new Error("email or password in invalid");
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      return { token };
      // pass above object mandatory
    },

    createQuote: async (_, { name }, { userId }) => {
      console.log(userId,"userId")



      if (!userId) throw new Error("You must be logged in");
      const newQuote = new Quote({
        name,
        by: userId,
      });
            console.log(newQuote, "userId---3");
      await newQuote.save();
      return "Quote saved successfully";
    },
  },
};

export default resolvers;
