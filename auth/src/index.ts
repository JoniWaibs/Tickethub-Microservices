import { connect } from 'mongoose';

import { server } from './app';

const PORT = 3000;

/**
 * Connect DDBB
 */
const start = async () => {
  if (!process.env.JWT_SECRET_KEY) throw new Error('JWT_SECRET_KEY is missing');
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing');

  try {
    await connect(process.env.MONGO_URI);

    console.log({ Info: `Connected to MongoDB` });
  } catch (error) {
    console.log({ Error: error });
    process.exit(1);
  }

  server.listen(PORT, () => console.log({ Info: `API V1 - auth server is listening on ${PORT}` }));
};
start();
