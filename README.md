# ASKE Uncharted HMI
![client](https://github.com/uncharted-aske/HMI/workflows/client/badge.svg)

Uncharted's Human Machine Interface for the DARPA ASKE program is designed to support visual exploration, curation, construction and execution of meta-models in a number of scientific domains.

## Setup
```shell script
yarn install
```

A `.env` file containing environment variables necessary for the application's operation must be placed under `./client/`. The repository contains a template `.env` file containing all the keys the application expects with dummy values. The fully populated `.env` file must not be be pushed to the repository.

Please duplicate the `./client/.env` file into `./client/.env.local` for local development. `.env.local` has been added to the `.gitignore` to avoid unintentional upload of the environment variables.

## Docker Compose
The client's docker image requires configuration via environment files. The environment files that are required
are `./client/.env.nginx` and `./client/.env.dist`. See Confluence for default configuration parameters.

Start docker compose:
```shell script
docker-compose up --build
```

Navigate to http://localhost/#/.

## Deployment
See Confluence for deployment instructions.

## Development

### PR review process
Writing a good PR description helps the reviewer to understand what you have done and how to review it. Below, we describe a PR description template to follow. Sections with a * are considered a must-have.

* **What** *: explain the changes you've made. It doesn't need to be fancy or technical, just explicit prose on the change. Reference a ticket in your issue if appropriate, but by all means, don't just reference the ticket. 
* **Why** *: explain the engineering goal this change achieves but also some higher-level goal that is satisfied. 
* **How** *: brief explanation of the approach taken and design decisions. 
* **Testing** *: explain the steps to test this change and let the reviewer also know if some conditions or edge cases were not tested, why they weren't tested, and any associated risks.
* **Screenshots** : this applies to UI-related tasks. A simple screenshot of the before and after helps the reviewer to understand the current state vs the development state.
* **Anything else**: you might want to call out challenges, technical debts, etc.


Example of a PR description [ref](https://www.pullrequest.com/blog/writing-a-great-pull-request-description/):

* **What** *: I've added support for authentication to implement Key Result 2 of OKR1. It includes model, table, controller and test. For more background, see ticket X.
* **Why** *: These changes complete the user login and account creation experience. See #JIRA-123 for more information.
* **How** *: This includes a migration, model and controller for user authentication. I'm using Devise to do the heavy lifting. I ran Devise migrations and those are included here.
* **Testing** *: I've added coverage for testing all new methods. I used Faker for a few random user emails and names.
* **Screenshots** : 0
* **Anything else**: Let's consider using a 3rd party authentication provider for this, to offload MFA and other considerations as they arise and as the privacy landscape evolves. AWS Cognito is a good option, so is Firebase. I'm happy to start researching this path. Let's also consider breaking this out into its own service. We can then re-use it or share the accounts with other apps in the future.


