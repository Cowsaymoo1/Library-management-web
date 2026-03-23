require('dotenv').config();
const express = require('express');
const app = express();
const port = Number(process.env.PORT) || 3000;

const { connectDB } = require('./config/connectDB');
const sync = require('./models/sync');

const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const route = require('./routes/index.routes');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');

app.use(
    cors({
        origin: true,
        credentials: true,
    }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../src')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-docs.json', (req, res) => {
    res.json(swaggerDocument);
});

// Khởi động server
const startServer = async () => {
    try {
        // Kết nối MongoDB
        await connectDB();

        // Gọi sync (không làm gì cả với MongoDB)
        sync();

        route(app);

        // Error handler middleware
        app.use((err, req, res, next) => {
            const statusCode = err.statusCode || 500;
            res.status(statusCode).json({
                success: false,
                message: err.message || 'Lỗi server',
            });
        });

        const server = app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });

        server.on('error', (err) => {
            if (err && err.code === 'EADDRINUSE') {
                console.error(`Port ${port} is already in use. Set PORT env var to use a different port.`);
                return;
            }
            console.error('Server listen error:', err);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
