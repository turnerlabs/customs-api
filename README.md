# Customs API

A service for moving information from external cloud services into private Harbor services.


## Deploy

Deploy a new version of an Container in a Shipment. If the `rollback` field is set, then there will
not be an attempt to catalog the image and the Shipment will rollback to an older version.


### POST `/deploy/:shipment/:environment/:provider`

> Catalogs the new container, updates the Shipment and triggers the deploy

#### Headers

```
x-build-token
- type:        String
- required:    true
- description: The build token associated with the Shipment
- requirement: Must be a valid build token
```


#### Fields

```
name
- type:        String
- required:    true
- description: Name of container (probably best to be role, like api, db)
- requirement: Must be a string using only [A-Za-z0-9_-]

image
- type:        String
- required:    true
- description: The Docker link to the Docker container without tag
- requirement: Must be a valid docker link, formatted:
               'registry.domain/docker-image-name' (must be a DNS label)

version
- type:        String
- required:    true
- description: The version of the container, will be used as the Docker image tag
- requirement: Must be a valid version

rollback
- type:        Boolean
- required:    false
- description: Roll back to a previous version. If this value is set, no call
               to CatalogIt will be made
- requirement: A boolean value
```


## Contributions

As with all projects in TurnerLab, contributions from Turner employees are welcome. This repo follows
[Vincent Driessen's Git Flow](http://nvie.com/posts/a-successful-git-branching-model/). Also it uses
[semver 2.0](http://semver.org/spec/v2.0.0.html). Make sure PRs are into `develop`, not `master`.
