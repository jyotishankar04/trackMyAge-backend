import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
};

export const config = Object.freeze(_config);
