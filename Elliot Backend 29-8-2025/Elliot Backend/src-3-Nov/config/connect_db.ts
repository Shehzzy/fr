import mongoose from 'mongoose';
import { config } from 'dotenv';
config();
import db_config from './db_config';


const connect_to_db = async () => {
      let { URI } = db_config


      let options: any = {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useFindAndModify: false,
            // useCreateIndex: true
            serverSelectionTimeoutMS: 10000,
      }


      mongoose.connect(URI, options);
      mongoose.connection.on("connected", (data: any) => {
            console.log("SERVER LOAD")
            console.log("connected to MongoDb");
      });
      mongoose.connection.on("error", (error: any) => {
            console.log(error);
      });

}

export default connect_to_db;