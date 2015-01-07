# Bower Shim Maintenance
This is one example of making Ember add-on using a Bower shim maintenance workflow. A Bower shim is basically a wrapper for some arbitrary set of files you want to become available in `bower_components` in a client application's project folders.

Using the `ember-cli` generator, developers can now easily add Bower dependencies to Ember projects via a call to `addBowerPackageToProject` in an `afterInstall` hook. More on this later.

With a Bower dependency being available and bundled, you can, say in Ember, do:

````
app.import('bower_components/my-shim-thing/main-file.js');
````

Say you've got a project, `target` and you love it. You want it to be an Ember add-on. However, you're not the maintainer of the actual `target` project, but a contributor (via fork, etc.). Instead, you're a loving bystander, anxious to help the larger community to use `target`.

In your `ember-cli`-based project, you want to be able to just chuck this dependency in. But there are hurdles. In order for this `target` package to get cannonized into community usage, you need it to be installable via Bower, and in turn `target` must have a shim available as an `npm` module.

Not very tall hurdles, mind you. But hurdles nonetheless. You need a plan.

For purposes of example, let's use `Ember.ListView` as a `target` project.


## If you build it

The `target` project ought to, as any good project does, manage its own build procedure. Maybe this involves running an `npm run [...]` task, something with `rake`, or `grunt`, or some such build procedure resulting with a set of shiny files in a `/dist` directory. Usually...

````
git clone [the target repo]
cd [target dir]
[build, e.g. npm run build-all, grunt build:production, etc]
````

This last part is wildly variable depending on the project, so, going with `Ember.ListView`, we'd do:

````
git clone https://github.com/emberjs/list-view.git
cd list-view
npm install
npm run build-all
````
Once the build procedure completes, you've got a nice set of files in `/dist`, including `list-view.js` and `list-view.min.js`.

## Now your part
A Bower shim is most easily created in a two-part fashion using a "bundle" and a "shim" pair of git repos. The way I set this up for `Ember.ListView` was by creating two git repositories: one for the built distribution, the other for the `npm` installable package.

I created a git repository called [ember-list-view-component](https://github.com/mysterlune/ember-list-view-component) to host the actual valuable files a user will want to import into an application project. This is not a project that a user of the shim will know anything about. This is here for the purpose of Bower to know where to get its package.

I created a git repository called [ember-cli-list-view](https://github.com/mysterlune/ember-cli-list-view) to host the `npm` installable package. For example, the first step in getting the `Ember.ListView` package into your project would be to add this as a dependency:

````
npm install ember-cli-list-view --save-dev
````

However, let's not get ahead of ourselves.

### component
* __component name__: ember-cli-list-view
* __component repo__: .../ember-list-view-component.git

Since you've easily created a distribution set of your `target` project using its own on-board build strategy, and you have a fine set of files to bundle up, first create your git repository (beyond the scope of this article).

The contents of my repository, or `component`, are like:

````
ember-list-view-component/
  .gitignore
  LICENSE
  README.md
  bower.json
  list-view.js
  list-view.min.js
````

The `bower.json` file should follow the standard specification for Bower projects. Refer to [the bower.json-spec](https://github.com/bower/bower.json-spec) for details. It's a file you need for the `component` to work with the `bower` command line interface when installing as a dependency.

The other files are all rather arbitrary as to what you should include. For my purpose, I've included the `list-view*` files, a `README.md` to clarify things to consumers, a `LICENSE`, and a `.gitignore` file to make commits less clumsy.

Once you've successfully committed and pushed your code to the repository and have your `component` sitting there at version `0.0.1`, you've taken a huge step.

If all you're doing is creating a Bower component, just follow the "Register" [steps to add](http://bower.io/docs/creating-packages/#register) your repository to Bower's package registry. __However__, since we're in the business of creating an Ember add-on, there are some things __not__ to do.

I want users to access this `component` using the typical `ember-cli-*` namespace convention, so will give it the name `ember-cli-list-view`. _Note: This can cause confusion when it comes to naming the_ `shim` _shortly, since it will be called_ `ember-cli-list-view`.

As far as creating a Bower dependency, you're pretty much all done. Now you should be able to run `bower install <my-package-name>` in any directory and have your `component` available in a `bower_components` directory.

### shim
* __shim name__: ember-cli-list-view
* __shim repo__: .../ember-cli-list-view.git

In order to make your `component` installable via `npm` (as Ember add-ons are typically done), another step is required. You want Ember devs to be able do run:

````
npm install <your-package> --save-dev
ember generate <your-package>
````
Under the hood, the `ember-cli` generator uses a blueprint to execute some code or move some files or whatever. Thanks to the excellent enhancement a la [@rwjblue](https://github.com/rwjblue), [#1830](https://github.com/stefanpenner/ember-cli/pull/1830), this is now pretty simple to install Bower dependencies using the `ember-cli` generator.

I created a second repository with these contents:

````
ember-cli-list-view/
  LICENSE.md
  README.md
  blueprints/ember-cli-list-view/index.js
  index.js
  package.json
````

For a look at what's inside (particularly the blueprint file), take a look at the [repository on Github](https://github.com/mysterlune/ember-cli-list-view). The blueprint's index file is where the `addBowerPackageToProject` call is made in the `afterInstall` hook.

Once the git repository is committed and a shiny new version `0.0.1` package is available, it is required that the package become registered with npmjs.org. Here are some useful resources:

* [Getting Started with NPM](https://gist.github.com/coolaj86/1318304)
* [Publishing npm packages](https://docs.npmjs.com/getting-started/publishing-npm-packages)

### ... and go!
With the shim and component available via Github, npmjs.org, and Bower.io, the work of installing an Ember add-on is just a tag-game away.

## Tag, you're it
So while you've published your NPM package, the `target` project has continued on with development, adding new features, fixing bugs, optimizing for performance, etc. At some point, you'll need to bring those changes into your `component`. Since `component` and `shim` are Bower and NPM (respectively) pointers to git repositories, tagging is the essential way for marking these packages for release and/or update.

Working with tags can seem tricky at first, but the premise is simple. Like any version control system branching and tagging are at the core of "labeling" your varying efforts. While a branch hosts development efforts off of the master branch, a tag is simply a marker (either on the master branch or a development branch) that says "at this point, this code is `<tag>`".

Using a tag, your consumers can do:

````
npm install <your-package>@<tag>
````

The NPM and Bower systems require [semver](http://semver.org/) versioning, and enable easy updating using a `version` command, e.g. in your project directory, you can simply do:

````
[bower|npm] version [<newversion> | major | minor | patch]
````

The version command also will update your git repository on the fly. From the docs on `npm version` [here](https://docs.npmjs.com/cli/version):

````
If run in a git repo, it will also create a version commit and tag, and fail if the repo is not clean.
````

The same exact phrasing conspicuously appears in the API documentation for `bower version` [here](http://bower.io/docs/api/#version). Since you're doing this work in a git repo, you can rest assured that your git tagging is handled with this command.

### Version tagging a la git
Skip this if you're doing shim maintenance since the `npm|bower version` commands automatically create (or are supposed to create) git tags for you. Just remember to do the `git push --tags` thing after using one of these other registries to bump your version.

However, if you are just trying to tag a version in your git repo (without regard to Bower or NPM), once you've made all your changes and are sure you want "this" version of the code to be a release version, you need to add a [git tag](http://git-scm.com/book/en/v2/Git-Basics-Tagging). Tags should follow semver, and start with "v". In your project directory do:

````
git tag -a v0.0.2 -m 'Update `target` to latest'
git push --tags
````

The `v0.0.2` assumes this is, say, your first update because your first version should have been `v0.0.1`.

### Bump an NPM package version
See the docs on [versioning](https://docs.npmjs.com/cli/version) NPM packages.

__Note__: Currently I'm having trouble with `npm` at version v0.11.14. Using a prior version, e.g. v0.10.33, seems to be okay.

````
cd [target package]
npm version patch -m 'Bumping version to s%'
git push --tags
npm publish
npm tag [target package]@[new given version] latest
````
The order matters here.

Remember, this repo hosts your shim, not your component. In order to update your component, you'll need to bump the bower version also.

### Bump a Bower package version
See the docs on [versioning](http://bower.io/docs/api/#version) Bower packages.

````
cd [target package]
bower version patch
git push --tags
````

## Conclusion
And that's all there is to it. Just kidding... this is a really convoluted Rube Goldberg system and should be much easier to deal with. The fact that front end developers are beholden to _both_ NPM and Bower to maintain dependenices is pretty much wrong. We should just be using NPM for this. I is unclear to me why Bower even needed to happen when NPM is doing a perfectly suitable job of managing dependencies -- both server- and client- side.

Hit @isaacs with suggestions if you have ideas that can help make NPM better with client-side dependencies.