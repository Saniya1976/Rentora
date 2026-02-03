import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyparser from "body-parser";
import helmet from 'helmet';
import morgan from 'morgan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.get('/', (req, res) => {
  res.send('Server is running');
  console.log('Root endpoint was hit');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});