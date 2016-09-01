# Customs API

[![CircleCI](https://circleci.com/gh/turnerlabs/customs-api/tree/master.svg?style=svg)](https://circleci.com/gh/turnerlabs/customs-api/tree/master)

A service for moving information from external cloud services into private Harbor services.


## Using the API

To use the API, you will need the Shipment's `buildToken`, which you can find either in Harbor's UI
or via an authenticated GET to the ShipIt API.

```shell
curl -s -X POST -H "x-build-token: ${SHIPMENT_BUILD_TOKEN}" -H 'Content-Type: application/json'\
    --data-binary '{"name": "<container-name>", "image": "<container-location>", "version": "<container-version>"}'\
    "https://customs.services.dmtio.net/deploy/${SHIPMENT}/${ENVIRONMENT}/${PROVIDER}"
```

In most cases, the `$PROVIDER` is `ec2`.

### Error Responses

* `400` - A required data field is missing. All requests require `name`, `image`, and `version`.

* `401` - The request is missing a build token. Build tokens must be passed using the `x-build-token` header.

* `403` - The supplied build token does not match the Shipment's build token.

* `409` - The container version already exists. Containers are immutable.


## Deploy Endpoint

Deploy a new version of an Container in a Shipment. If the `catalog` field is set, then there will
be an attempt to catalog the image in the CatalogIt API.


### POST `/deploy/:shipment/:environment/:provider`

> Catalogs the new container, updates the Shipment and triggers the deploy

#### Headers

```yaml
x-build-token
- type:        String
- required:    true
- description: The build token associated with the Shipment
- requirement: Must be a valid build token
```


#### Fields

```yaml
name
- type:        String
- required:    true
- description: Name of container (probably best to be role, like api, db)
- requirement: Must be a string using only [A-Za-z0-9_-]

image
- type:        String
- required:    true
- description: The Docker link to the Docker container without tag
- requirement: Must be a valid docker link, formatted: 'registry.domain/docker-image-name' (must be a DNS label)

version
- type:        String
- required:    true
- description: The version of the container, will be used as the Docker image tag
- requirement: Must be a valid version

catalog
- type:        Boolean
- required:    false
- description: The container should be cataloged in CatalogIt.
- requirement: A boolean value
```


## Running the API

In order to run the Customs API there are several Env Vars that are required.

* `PORT` - Technically, not required. Defaults to `6754`.

* `SHIPIT_API` - URL to ShipIt API.

* `SHIPIT_AUTH_USER` - Username to use for ShipIt API authorization calls.

* `SHIPIT_AUTH_TOKEN` - Token to use for ShipIt API authorization calls. Should be a long-lived token.

* `CATALOGIT_API` - URL to CatalogIt API.

* `TRIGGER_API` - URL to Trigger API.


## Contributions

Develop [![CircleCI](https://circleci.com/gh/turnerlabs/customs-api/tree/develop.svg?style=svg)](https://circleci.com/gh/turnerlabs/customs-api/tree/develop)

As with all projects in TurnerLab, contributions from Turner employees are welcome. This repo follows
[Vincent Driessen's Git Flow](http://nvie.com/posts/a-successful-git-branching-model/). Also it uses
[semver 2.0](http://semver.org/spec/v2.0.0.html). Make sure PRs are into `develop`, not `master`.
