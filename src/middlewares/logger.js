function log () {
    return (req, res, next) => {
        console.log(req.sessionID);
        next();
    }
}

module.exports = log;