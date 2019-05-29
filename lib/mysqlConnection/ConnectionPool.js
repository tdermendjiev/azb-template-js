module.exports = (function () {
    var mysql = require('mysql'),
        config = require('../../config'),
        pool = mysql.createPool(config.database);

    pool.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
        if (err) throw err;

        logger.info('Pool connected!');
    });
    return pool;
})();