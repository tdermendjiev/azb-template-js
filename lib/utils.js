exports.asyncFromPromise = function(promise, name) {
    return function (callback) {
        promise
            .then(function (results) {
                return callback(null, results);
            })
            .fail(function (err) {
                return callback(err, null);
            });
    };
};