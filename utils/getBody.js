const getBody = (req) => {
    if(req.method === 'GET') {
        return req.query;
    } else { 
        return req.body;
    }
}

module.exports = {
    getBody,
}