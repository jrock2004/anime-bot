require('es6-promise').polyfill();
const fetch = require('isomorphic-fetch');

export default class Api {
  search = async(variables:object, query:string) => {
    const url = 'https://graphql.anilist.co',
      options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      };

    const response = await fetch(url, options);
    const body = await response.json();

    return body;
  }
}
