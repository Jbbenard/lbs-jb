// Quand la ressource n'existe pas
const handler404 = function(res) {
    res.status(404).json({
        type: 'error',
        error: 404,
        message: 'Not Found'
    });
}

module.exports = handler404;
