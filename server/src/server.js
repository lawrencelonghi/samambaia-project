import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
//# sourceMappingURL=server.js.map