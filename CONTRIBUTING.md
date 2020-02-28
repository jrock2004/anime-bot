# Contributing

I am not against anyone who would like to help contribute to this bot. This will talk about the requirements for you to do so.

## Prerequisites

You will need the following things properly installed on your computer.

- [Git](http://git-scm.com/)
- [Node.js](http://nodejs.org/) (with NPM)
- [Postman](https://www.postman.com) (Or how ever you call API's)

## Installation

- Fork the repo
- Clone your forked repo
- Run the following command in your terminal:

```bash
> npm install
```

## Running the code

To run the code is fairly easy. You will need to come up with a token. It can be anything you want. Then in your terminal, run the following:

```bash
> npm run build && TOKEN=9999 npm run serve
```

When it is ready you see that it is listening on port 9000. Your machine might be a different port if that is already in use.

Now open Postman and set the API call to POST, and for the URL, put `http://localhost:9000/.netlify/functions/server/anime`. Then in the body of the API call you will want to enter the following as JSON.

```json
{
  "text": "My Hero",
  "response_url": "slack",
  "token": "9999"
}
```

Let me break down what each of these mean.

| Property     | Answer                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| text         | This is the name of the anime you want to look up                                                                                        |
| response_url | You will want to enter slack here if you do not want the response to be in markdown. Slack does not support markdown but Mattermost does |
| token        | This is the token you need to pass to the server that matches the token you set when starting the server                                 |

## Submitting a PR

When you think you are ready, you can go ahead and open a PR. You will need to explain what you are
enhancing or changing. Without this information, your PR will just get closed.
