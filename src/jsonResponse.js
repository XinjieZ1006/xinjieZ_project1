const fs = require('fs');

// Setup data from the file
let repos = fs.readFileSync(`${__dirname}/../data/NodeJS.json`);
repos = JSON.parse(repos);

const respondJSON = (req, res, status, object) => {
    console.log(`url: ${req.url}`);
    const content = JSON.stringify(object);
    const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content, 'utf8'),
    };
    res.writeHead(status, headers);
    if (req.method !== 'HEAD') {
        res.write(content);
    }
    res.end();
};

const getAllRepos = (req, res) => {
    const responseJson = { repos };
    return respondJSON(req, res, 200, responseJson);
};

const getAllReposShort = (req, res) => {
    const responseJson = repos.map(r => ({
        id: r.id,
        full_name: r.full_name,
        description: r.description,
    }));
    return respondJSON(req, res, 200, responseJson);
};

const getRepo = (req, res) => {
    let filteredResults = repos;
    const { repo_name, username } = req.query;

    if (!repo_name || !username) {
        return respondJSON(req, res, 400, {
            id: "missingParams",
            message: "Missing one or more required parameters",
        });
    }

    filteredResults = filteredResults.filter(o => o.repo_name === repo_name && o.username === username);
    return respondJSON(req, res, 200, filteredResults);
};

const getReposByFilters = (req, res) => {
    let filteredResults = repos;
    const { topic, language, type, stars } = req.query;

    if (topic) filteredResults = filteredResults.filter(repo => repo.topics.includes(topic));
    if (language) filteredResults = filteredResults.filter(repo => repo.language === language);
    if (type) filteredResults = filteredResults.filter(repo => repo.type === type);
    if (stars) filteredResults = filteredResults.filter(repo => repo.stars >= parseInt(stars));

    return respondJSON(req, res, 200, filteredResults);
};

const addRepo = (req, res) => {
    let body = '';
    req.on('error', (err) => {
        console.error(err);
        res.statusCode = 400;
        res.end();
    });

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            req.body = JSON.parse(body);
        } catch (e) {
            return respondJSON(req, res, 400, {
                id: 'jsonFailure',
                message: 'Invalid JSON',
            });
        }

        const { repo_name, username, topic, language, description, type } = req.body;
        if (!repo_name || !username || !language || !type) {
            return respondJSON(req, res, 400, {
                id: 'missingParams',
                message: 'Missing one or more required params',
            });
        }

        if (!repos.some(r => r.repo_name === repo_name && r.username === username)) {
            repos.push({
                id: Date.now(), // Generate unique ID
                repo_name,
                username,
                topics: topic ? [topic] : [],
                language,
                description,
                type,
            });

            return respondJSON(req, res, 201, {
                id: 'created',
                message: 'Repo successfully created',
            });
        }

        return respondJSON(req, res, 204, {});
    });
};

const addTopic = (req, res) => {
    let body = '';
    req.on('error', (err) => {
        console.error(err);
        res.statusCode = 400;
        res.end();
    });

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            req.body = JSON.parse(body);
        } catch (e) {
            return respondJSON(req, res, 400, {
                id: 'jsonFailure',
                message: 'Invalid JSON',
            });
        }

        const { id, topic } = req.body;

        if (!id || !topic) {
            return respondJSON(req, res, 400, {
                id: 'missingParams',
                message: 'Missing one or more required params',
            });
        }

        const repo = repos.find(r => r.id === parseInt(id));

        if (!repo) {
            return respondJSON(req, res, 404, {
                id: 'notFound',
                message: 'Could not find repo with the given ID',
            });
        }

        if (!repo.topics.includes(topic)) {
            repo.topics.push(topic);
        }

        return respondJSON(req, res, 201, repo);
    });
};

const notFound = (req, res) => {
    return respondJSON(req, res, 404, {
        id: 'notFound',
        message: 'Page not found.',
    });
};

module.exports = {
    getAllRepos,
    getAllReposShort,
    getRepo,
    getReposByFilters,
    addRepo,
    addTopic,
    notFound,
};
