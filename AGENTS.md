# AGENTS.md

## Cursor Cloud specific instructions

### Repository overview

This repository serves two purposes:

1. **Spring Cloud Config Server configuration**: YAML files at the root and in `file1/`, `file2/`, `spring-cloud-user/` directories. These are consumed by an **external** Spring Cloud Config Server (not included in this repo).
2. **Tank Battle game** (`tank-battle/`): A standalone HTML5 Canvas arcade game (坦克大战) written in vanilla JS/CSS/HTML. No build step, no dependencies.

### Running the application

The only runnable application in this repo is the Tank Battle game. Serve it with any static file server:

```
python3 -m http.server 8080 -d tank-battle
```

Then open `http://localhost:8080/` in a browser.

### Lint / Test / Build

This repository has no package manager, no test framework, no linter, and no build system. The YAML configs are validated by the Spring Cloud Config Server at runtime. The tank-battle game is pure static HTML/JS/CSS with no transpilation.

### Notes for cloud agents

- There are no dependencies to install — no `package.json`, `requirements.txt`, `Makefile`, or similar.
- The YAML config files reference external infrastructure (MySQL on `localhost:3306`, Eureka on `127.0.0.1:1234`) that is **not** needed for local development of this repo.
- `encrypt-bak.yml` contains a Spring Cloud Config `{cipher}` value — do not treat as a secret leak; it requires the Config Server's encryption key to decrypt.
