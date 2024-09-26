const restrictOrigin = (req, res, next) => {
    const disallowedAgents = ["PostmanRuntime", "curl", "Insomnia", "HttpClient"];
    
    const userAgent = req.headers['user-agent'] || '';
    const lowerUserAgent = userAgent.toLowerCase();

    if (disallowedAgents.some(agent => lowerUserAgent.includes(agent.toLowerCase()))) {
        return res.status(403).json({ message: "Access denied" });
    }

    next();
};

module.exports = restrictOrigin