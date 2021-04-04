// Quand la méthode utilisée ne correspond pas
const handler405 = function(req, res) {
    res.status(405).json({
        type: 'error',
        error: 405,
        message: 'Method Not Allowed'
    });
}

module.exports = handler405;
