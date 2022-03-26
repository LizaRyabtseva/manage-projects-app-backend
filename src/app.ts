import Express, {Application} from 'express';
import bodyParser from 'body-parser';

import projectRoutes from './routes/projectRoutes';
import authRoutes from './routes/authRoutes';
import sprintRoutes from './routes/sprintRoutes';

const app: Application = Express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/projects', projectRoutes);
app.use('/projects/:projectId', sprintRoutes);
app.use('/join', authRoutes);

app.listen(process.env.PORT, () => console.log(`Listen on ${process.env.port} port.`));