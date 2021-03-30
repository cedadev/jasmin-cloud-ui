# jasmin-cloud-ui

Web portal frontend for the [JASMIN Cloud API](https://github.com/cedadev/jasmin-cloud).

## Setting up a development environment

First, make sure you have a local version of the [JASMIN Cloud API](https://github.com/cedadev/jasmin-cloud)
running on `http://localhost:8000`, as per the instructions in the `README`.

In order to install and run the JASMIN Cloud Portal user interface, you will need [Node](https://nodejs.dev/)
and [yarn](https://yarnpkg.com/) installed.

Check out the code:

```sh
git clone https://github.com/cedadev/jasmin-cloud-ui.git
cd jasmin-cloud-ui
```

Initialise git submodules:

```sh
git submodule update --init --recursive
```

Install the dependencies using `yarn`:

```sh
yarn install --immutable
```

Then start the development server:

```sh
yarn serve
```

This will start the JASMIN Cloud UI at `http://localhost:3000`.
