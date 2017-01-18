const GitHubAPI = {};
const STATUS_OK = '200 OK';
const PRIVATE_AUTH_TOKEN  = '68a6814b713bdf46f7469d7f00b3f5712e309a46';

GitHubAPI.getEverything = (user, repo, cursor=null) => {
  const url = 'https://api.github.com/graphql';
  const method = 'POST';
  const headers = new Headers({
    'Authorization': `bearer ${PRIVATE_AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  });
  const body = JSON.stringify({
    query: `query getStargazers($user: String!, $repo: String!, $cursor: String) {
      repository(owner: $user, name: $repo) {
        owner {
          login
          avatarURL
        }
        name
        description
        stargazers(first: 100, after: $cursor, orderBy: {field: STARRED_AT, direction: ASC}) {
          edges {
            cursor
            starredAt
            node {
              login
              location
            }
          }
          totalCount
          pageInfo {
            hasNextPage
          }
        }
      }
    }`,
    variables: {
      user,
      repo,
      cursor
    },
    operationName: 'getStargazers'
  });
  return fetch(url, {
    method,
    headers,
    body
  }).then(r => {
    if (r.status === 200) {
      return r.json();
    }

    if (r.headers.get('X-RateLimit-Remaining') === '0') {
      const rateLimitReset = new Date(1000 * r.headers.get('X-RateLimit-Reset'));
      return Promise.reject(`Rate limit exceeded. Will be reset at ${rateLimitReset}.`);
    }
  }).then(r => {
    if (!r.data) {
      return Promise.reject(r.message);
    }

    const edges = r.data.repository.stargazers.edges;
    const lastCursor = edges[edges.length - 1].cursor;
    return Promise.resolve({
      user: r.data.repository.owner.login,
      repo: r.data.repository.name,
      description: r.data.repository.description,
      stars: r.data.repository.stargazers.totalCount,
      locations: edges.map(edge => edge.node.location).filter(location => location),
      lastCursor
    });
  });
}

GitHubAPI.getRepo = (user, repo) => {
  const API_URL = `http://jrvis.com/red-dwarf/api/repos/${user}/${repo}`;
  return fetch(API_URL).then(response => response.json()).then(response => {
    if (!GitHubAPI.isOK(response)) {
      return Promise.reject(response.status);
    }

    return Promise.resolve(response.data);
  });
};

GitHubAPI.getUsers = (user, repo, stars) => {
  const pages = Math.ceil(stars / 100);
  const users = [];
  for (let page = 1; page <= pages; page++) {
    let API_URL = `http://jrvis.com/red-dwarf/api/users/${user}/${repo}?page=${page}&per_page=100`;
    users.push(fetch(API_URL).then(response => response.json()).then(response => {
      if (!GitHubAPI.isOK(response)) {
        return Promise.resolve([]);
      }

      return Promise.resolve(response.data.map(user => user.login));
    }));
  }
  return Promise.all(users).then(values => {
    return Promise.resolve(values.reduce((all, value) => all.concat(value), []));
  });
};

GitHubAPI.getLocations = (users) => {
  const locations = [];
  for (let user of users) {
    let API_URL = `http://jrvis.com/red-dwarf/api/users/${user}`;
    locations.push(fetch(API_URL).then(response => response.json()).then(response => {
      if (!GitHubAPI.isOK(response)) {
        return Promise.resolve(null);
      }

      return Promise.resolve(response.data.location);
    }).catch(e => {
      console.log(e);
      return Promise.resolve(null);
    }));
  }
  return Promise.all(locations).then(values => {
    return Promise.resolve(values.filter(value => value));
  });
}

GitHubAPI.isOK = (response) => {
  return (response && response.status && response.status === STATUS_OK);
};

export default GitHubAPI;
