const config = {
    host: '127.0.0.1',
    port: process.env.PORT || 3000,
    database: {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'dbname',
        charset : 'utf8mb4',
        multipleStatements: true,
        acquireTimeout: 30000
    },
    apiPrefix: '/apiv1',
    apiKeys: {
    }
};
module.exports = config;
