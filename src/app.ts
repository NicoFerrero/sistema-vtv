import config from './utils/config';
import connect from './utils/mongo.db';
import createServer from './utils/server';

const app = createServer();
const port = config.server.port;
app.listen(port, async () => {
    console.info(`App is running at http://localhost:${port}`);
    await connect();
});
