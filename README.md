# rfm-cli

**rfm(Rim Forming Machine) - CLI Scaffold for quick project kickoff**

_-- It can greatly improve the efficiency of your [wheel](https://en.wikipedia.org/wiki/Reinventing_the_wheel) production!_

<div align="center">
  <p>· · ·</p>
  <p><b>Rim Forming Machine</b> <sup><sub>... or React Frontend Maker?</sub></sup></p>
  <p>【 轮 毂 一 体 成 型 机 】</p>
  <img src="https://user-images.githubusercontent.com/6898060/166718450-b073cb24-15a9-463e-8d74-0af34e95aecd.png" alt="rim forming machine">
  <p><sup><i>Image from <a href="http://wheel-machinery.com/2-2-roll-forming-machine.html">Taizhi</a> and artisticized by <a href="https://www.befunky.com/">befunky</a>.</i></sup></p>
</div>

## Usage

```bash
npm install -g rfm-cli
rfm-cli -t targetpath/of/newproject
```

## Dev

```bash
# install
npm install

# watch
npm run watch

# test in repo
npm run test-cli

# test outer
npm link
cd where/you/want/to/create
rfm-cli -t targetpath/of/newproject
```

## TODO

to v1: (issue https://github.com/neoddish/rfm-cli/issues/2)

* [ ] support exe shell after create repo
* [ ] create repo by manifest
* [ ] support subrepo
* [ ] support demo/site subrepo
* [ ] better commands
* [ ] support react
* [ ] support webpack
* [ ] support electron
* [ ] lerna project
* [ ] pretty commands
