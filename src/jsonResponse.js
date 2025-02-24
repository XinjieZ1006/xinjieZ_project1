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
  // just return the entire object
  const responseJson = { repos };
  return respondJSON(req, res, 200, responseJson);
};

const getAllReposShort = (req, res) => {
  // form a shortened object
  const responseJson = repos.map((r) => ({
    id: r.id,
    full_name: r.full_name,
    description: r.description,
  }));
  return respondJSON(req, res, 200, responseJson);
};

const getRepo = (req, res) => {
  const filteredResults = repos;
  const { repo_name: repoName, username } = req.query;

  if (!repoName || !username) {
    return respondJSON(req, res, 400, {
      id: 'missingParams',
      message: 'Missing one or more required parameters',
    });
  }

  const result = filteredResults.filter((o) => o.repo_name === repoName && o.username === username);
  return respondJSON(req, res, 200, result);
};

const getReposByFilters = (req, res) => {
  let filteredResults = repos;
  const {
    topic, language, type, stars,
  } = req.query;

  if (topic) filteredResults = filteredResults.filter((repo) => repo.topics.includes(topic));
  if (language) filteredResults = filteredResults.filter((repo) => repo.language === language);
  if (type) filteredResults = filteredResults.filter((repo) => repo.type === type);
  if (stars) filteredResults = filteredResults.filter((repo) => repo.stars >= parseInt(stars, 10));

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

    const {
      repo_name: repoName, username, topic, language, description, type,
    } = req.body;
    if (!repoName || !username || !language || !type) {
      return respondJSON(req, res, 400, {
        id: 'missingParams',
        message: 'Missing one or more required params',
      });
    }

    if (!repos.some((r) => r.repo_name === repoName && r.username === username)) {
      // if repo does not exist yet, create a new repo
      const repo = {
        created: Date.now(),
        repo_name: repoName,
        username,
        topics: topic ? [topic] : [],
        language,
        description,
        type,
      };
      repos.push(repo);

      return respondJSON(req, res, 201, repo);
    }

    // will work on the update logic later
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

    // get the corresponding repo obj
    const repo = repos.find((r) => r.id === parseInt(id, 10));

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

const notFound = (req, res) => respondJSON(req, res, 404, {
  id: 'notFound',
  message: 'Page not found.',
});

module.exports = {
  getAllRepos,
  getAllReposShort,
  getRepo,
  getReposByFilters,
  addRepo,
  addTopic,
  notFound,
};
