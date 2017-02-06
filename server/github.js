const fetch = require('node-fetch');

const AUTH_TOKEN = process.env.GITHUB_AUTH_TOKEN;
const API_URL = 'https://api.github.com/graphql';
const METHOD = 'POST';
const HEADERS = {
  'Authorization': `bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

exports.getEverything = getEverything = (user, repo, cursor=null) => {
  if (!AUTH_TOKEN) {
    return Promise.reject('Invalid authorization token.');
  }

  const body = getGraphQlBody(user, repo, cursor);
  return new Promise((resolve, reject) => {
    fetch(API_URL, {
      method: METHOD,
      headers: HEADERS,
      body
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      }

      if (response.headers.get('X-RateLimit-Remaining') === '0') {
        const rateLimitReset = new Date(1000 * response.headers.get('X-RateLimit-Reset'));
        return reject(`Rate limit exceeded. Will be reset at ${rateLimitReset}.`);
      }

      return reject(response.statusText);
    }).then(response => {
      if (!response.data) {
        reject(response.message);
        return;
      }

      const repository = response.data.repository;
      if (!repository) {
        console.log(response);
        resolve({});
        return;
      }

      const edges = repository.stargazers.edges;
      const locations = edges.map(edge => edge.node.location).filter(location => location);
      const lastCursor = edges.length ? edges[edges.length - 1].cursor : cursor;

      if (repository.stargazers.pageInfo.hasNextPage) {
        // Recursive promises whaaaaaat??
        getEverything(user, repo, lastCursor).then(data => {
          resolve(Object.assign(data, {
            locations: locations.concat(data.locations)
          }));
        });
        return;
      }

      resolve({
        user: repository.owner.login,
        repo: repository.name,
        description: repository.description,
        isFork: repository.isFork,
        stars: repository.stargazers.totalCount,
        locations,
        cursor: lastCursor
      });
    });
  });
};

function getGraphQlBody(user, repo, cursor) {
  return JSON.stringify({
    query: `query getStargazers($user: String!, $repo: String!, $cursor: String) {
      repository(owner: $user, name: $repo) {
        owner {
          login
          avatarURL
        }
        name
        description
        isFork
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
};
