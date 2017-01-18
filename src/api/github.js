const GitHubAPI = {};
const STATUS_OK = '200 OK';
const PRIVATE_AUTH_TOKEN  = '68a6814b713bdf46f7469d7f00b3f5712e309a46';

GitHubAPI.getEverything = (user, repo) => {
  const url = 'https://api.github.com/graphql';
  const method = 'POST';
  const headers = new Headers({
    'Authorization': `bearer ${PRIVATE_AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  });
  const body = JSON.stringify({
    query: `query getStargazers($user: String!, $repo: String!) {
      repository(owner: $user, name: $repo) {
        owner {
          login
          avatarURL
        }
        name
        description
        stargazers(first: 100, orderBy: {field: STARRED_AT, direction: ASC}) {
          edges {
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
      repo
    },
    operationName: 'getStargazers'
  });
  fetch(url, {
    method,
    headers,
    body
  }).then(r => r.json()).then(r => {
    console.log(r);
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
