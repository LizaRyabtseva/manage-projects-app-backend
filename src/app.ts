import Express, {Application, Request, Response, NextFunction} from 'express';
import bodyParser from 'body-parser';
import projectRoutes from "./routes/projectRoutes";
import authRoutes from './routes/authRoutes';

const app: Application = Express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/projects', projectRoutes);
app.use('/auth', authRoutes);

app.listen(5000, () => console.log('Listen on 5000'));