import serverless from 'serverless-http';
import expressApp from './app';

const functionName = 'serverless-http';

const app = expressApp(functionName);

exports.handler = serverless(app);
