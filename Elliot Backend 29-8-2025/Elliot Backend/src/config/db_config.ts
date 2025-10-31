
import { config } from 'dotenv';
config();

const env = process.env.ENVIRONMENT
let server_port = process.env.LOCAL_PORT
if (env == 'PROD') { server_port = process.env.PROD_PORT }


// LOCAL database creds
const LOCAL_DB_URL = process.env.LOCAL_DB_URL


const db_config = {
      PORT: server_port,
      URI: `${LOCAL_DB_URL}`

}



export default db_config