


import { config } from "./src/config/config";
import app from "./src/index";

const startServer = async () => {
    const port = config.port || 3001
  app.listen(port, () => {
    console.log(`Listening on port number: ${port}`);
  });
};
startServer();