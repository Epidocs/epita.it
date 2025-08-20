# EPITA.it

The open source web portal for EPITA websites and projects

Visit the website: [epita.it](https://epita.it/)


## Getting started

### Development

Use this command to run the site locally for development:

```sh
docker compose watch
# or: docker compose up
```

Using `watch`, you'll benefit from file changes watching for sync & rebuild.

Use [DockerC](https://github.com/matiboux/dockerc) for shortened commands: `dockerc - @w`.

The site will be available at [http://localhost:8080](http://localhost:8080).

### Production

Use this command to run the site locally for production:

```sh
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
# or: docker compose -f docker-compose.yml up -d
```

Use [DockerC](https://github.com/matiboux/dockerc) for shortened commands: `dockerc prod`.

The site will be available at [http://localhost:8080](http://localhost:8080).


## Contributing

To report a bug or suggest a feature, please see [the existing issues](https://github.com/Epidocs/epita.it/issues) on GitHub or open a new issue.

To contribute directly, you can fork this project, make your changes, and then open a pull request! Use the instructions above to run the site locally for development and test your changes.


### Add links

Links in the web portal are managed in YAML files, located in [`app/app/src/data/`](app/app/src/data/). You can add links to a specific page by editing the corresponding `.yml` file.

For example, if you want to update links on the home page, you can edit [`app/app/src/data/links.yml`](app/app/src/data/links.yml).

Please note the order of items determines how links are displayed on the website.


## Hosting your own project

EPITA.it does not offer hosting services, but can help you find resources to build and publish your project.

### Get an EPITA.it subdomain for your project

You can request to use an EPITA.it subdomain for your project, given that it is related to EPITA or the EPITA community.

For example, you can request a subdomain like `yourawesomeproject.epita.it` and have it point to your web server or service provider (like GitHub Pages) for serving your project.

To make this request, you can open an issue here or contact [@matiboux](https://github.com/matiboux) directly via Telegram or Discord. We'll discuss your request, project, and help you move forward if everything looks good!


## License

**Creative Commons Attribution-NonCommercial 4.0 International License**
([*CC BY-NC 4.0*](https://creativecommons.org/licenses/by-nc/4.0))  
Copyright (c) 2019-2024 Mathieu Guérin (Matiboux)

*Disclaimer:* External resources are the property of their respective owners,
and therefore are not subject to this license (e.g. images from external links).
