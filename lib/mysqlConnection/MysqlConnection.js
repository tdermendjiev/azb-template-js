var connectionPool = require('./ConnectionPool'),
    Q = require('q');

exports.queryFormat = function (mysqlConnection) {
    mysqlConnection.config.queryFormat = function (query, values) {
        if (!values) return query;
        return query.replace(/\:(\w+)/g, function (txt, key) {
            if (values.hasOwnProperty(key)) {
                return this.escape(values[key]);
            }
            return txt;
        }.bind(this));
    };
    return mysqlConnection;
};

exports.makeQuery = function (query, args, filter, debug) {
    let deferred = Q.defer(),
        me = this;

    if (!filter || typeof filter !== 'function') {
        filter = function (_) { return _; };
    }

    connectionPool.getConnection(function (err, connection) {
        if (err) {
            logger.error(err);
            return deferred.reject(err);
        }
        connection = me.queryFormat(connection);

        let q = connection.query(query, args, function (err, results) {
            if (debug === true) {
                logger.info('makeQuery', q.sql);
            }
            connection.release();
            if (err) {
                logger.error(err);
                return deferred.reject(err);
            }
            return deferred.resolve(filter(results));
        });
    });

    return deferred.promise;
};

exports.getTransactionConnection = function() {
    var deferred = Q.defer(),
        me = this;

    connectionPool.getConnection(function (err, connection) {
        connection.beginTransaction(function(err) {
            if (err) {
                logger.error(err);
                return connection.rollback(function() {
                    connection.release();
                    deferred.reject( err);
                });
            }
            let conn = me.queryFormat(connection)
            deferred.resolve(conn);
        });
    });

    return deferred.promise;
};

exports.executeTransactionQuery = function(connection, query, args, filter, debug) {
    var deferred = Q.defer();

    if (!filter || typeof filter !== 'function') {
        filter = function (_) {return _;};
    }

    var q = connection.query(query, args, function (err, results) {
        if (debug === true) {
            logger.info('makeQuery', q.sql);
        }
        if (err) {
            logger.error(err);
            return connection.rollback(function() {
                connection.release();
                deferred.reject( err);
            });
        }

        return deferred.resolve(filter(results));
    });

    return deferred.promise;
};

exports.commitTransactionAndRelease = function(connection) {
    var deferred = Q.defer();

    connection.commit(function(commitErr) {
        if (commitErr) {
            connection.rollback(function() {
                connection.release();
                deferred.reject(commitErr);
            });
        }
        connection.release();

        deferred.resolve(true);
    });

    return deferred.promise;
};

exports.escape = function (string) {
    return connectionPool.escape(string);
};

