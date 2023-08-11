## Installation

```
$ npm install --save-dev serverless-doppler-dotenv-secrets
```

## Configuration

- All doppler configuration parameters are required.

```
# add in your serverless.yml

plugins:
  - serverless-doppler-dotenv-secrets

custom:
  doppler:
    dopplerToken: ${param:doppler-token, env:DOPPLER_TOKEN, 'UNDEFINED'}
    environmentSlug: ${param:environment, 'dev'}
    projectName: ${param:project-name, self:service, 'UNDEFINED'}
```

## Usage

run the command below before running `serverless deploy`

```bash
sls create-dotenv --param="doppler-token=<your-doppler-token-here>" --param="environment=<your-environment-slug-here>" --param="project-name=<your-project-name-here>"
```

> You can export `DOPPLER_TOKEN` to your session and run `sls create-dotenv` without the `--param` flag for the token.

### Notes

- `dopplerToken` is a required parameter and it can be passed as an environment variable or as a parameter in the command line or it will default to `UNDEFINED` and the command will error with 401 as return code.

- `environmentSlug` is the Doppler project environment slug. It can be passed as a parameter in the command line or it will default to `dev`.

- `projectName` is the Doppler project name. It can be passed as a parameter in the command line or it will default to `UNDEFINED` and the command will error with 404 as return code.
