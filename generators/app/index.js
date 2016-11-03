'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var packagejs = require(__dirname + '/../../package.json');
var cheerio = require('cheerio');

// Stores JHipster variables
var jhipsterVar = {moduleName: 'transasia'};

// Stores JHipster functions
var jhipsterFunc = {};

var STRIP_HTML = 'stripHtml',
    STRIP_JS = 'stripJs',
    COPY = 'copy',
    TPL = 'template'

module.exports = yeoman.generators.Base.extend({
  initializing: {
    compose: function (args) {
      this.composeWith('jhipster:modules', {
        options: {
          jhipsterVar: jhipsterVar,
          jhipsterFunc: jhipsterFunc
        }
      });
    },

    displayLogo: function () {
      this.log(chalk.white('Welcome to the ' + chalk.bold('JHipster Transasia design') + ' Module! ' + chalk.yellow('v' + packagejs.version + '\n')));
    }
  },
  prompting: function () {
    var done = this.async();

    var prompts = [{
      type: 'confirm',
      name: 'confirm',
      message: 'Would you like to enable Transasia corporate style?',
      default: true
    }];

    this.prompt(prompts, function (props) {
      this.props = props;
      // To access props later use this.props.someOption;
      this.confirm = props.confirm;
      done();
    }.bind(this));
  },

  writing: {
    setupGlobalVar : function () {
      this.baseName = jhipsterVar.baseName;
      this.angularAppName = jhipsterVar.angularAppName;
      this.authenticationType = jhipsterVar.authenticationType;
      this.webappDir = jhipsterVar.webappDir;
      this.copyFiles = function (files) {
        files.forEach( function(file) {
          jhipsterFunc.copyTemplate(file.from, file.to, file.type? file.type: TPL, this, file.interpolate? { 'interpolate': file.interpolate } : undefined);
        }, this);
      };
    },

    writeClientSideFiles : function () {

      // Add bower dependencies
      jhipsterFunc.addBowerDependency('metisMenu', '^2.5.2');
      jhipsterFunc.addBowerDependency('jquery-slimscroll', 'slimscroll#^1.3.8');
      jhipsterFunc.addBowerDependency('PACE', 'pace#^1.0.2');
      jhipsterFunc.addBowerDependency('animate.css', '^3.5.2');

      //jhipsterFunc.addMainCSSStyle(this.useSass, style, 'Fix error field display')

      // collect files to copy
      var files = [
        { from: this.webappDir + '/app/content/css/_transasia.css', to: this.webappDir + '/app/content/css/transasia.css'},
        { from: this.webappDir + '/app/directives/_directives.js', to: this.webappDir + '/app/directives/directives.js'},
        { from: this.webappDir + '/app/layouts/sidebar/_sidebar.controller.js', to: this.webappDir + '/app/layouts/sidebar/sidebar.controller.js'},
        { from: this.webappDir + '/app/layouts/sidebar/_active-link.directive.js', to: this.webappDir + '/app/layouts/sidebar/active-link.directive.js'},
        { from: this.webappDir + '/app/layouts/sidebar/_active-menu.directive.js', to: this.webappDir + '/app/layouts/sidebar/active-menu.directive.js'},
        { from: this.webappDir + '/app/layouts/sidebar/_sidebar.html', to: this.webappDir + '/app/layouts/sidebar/sidebar.html'},
        { from: this.webappDir + '/app/content/js/_inspinia.js', to: this.webappDir + '/app/content/js/inspinia.js'}
        ,{ from: this.webappDir + '/app/_index.html', to: this.webappDir + '/app/index.html'}
      ];
      this.copyFiles(files);
    },

    updateClientSideFiles : function () {


      jhipsterFunc.rewriteFile(this.webappDir + '/index.html', '<!-- build:css content/css/main.css -->',
        '<!-- placeholder link to load transasia style, title holds the current applied theme name-->\n' +
        '<link href="bower_components/animate.css/animate.css" rel="stylesheet">\n ' +
        '<link href="content/css/transasia.css" rel="stylesheet">\n ');

      var html = this.fs.read(this.webappDir + '/index.html');



      //-----parse DOM in index.html -------
      // CSS selectors ot Xpath
      var $ = cheerio.load(html);

      var footer = $('.footer');

      footer.append('<div id="wraper"></div>\n ' +
        '<div>btl 2016</div>\n');

      this.fs.write(this.webappDir + '/index.html', $.html());

     //var indexFullPath = 'src/main/webapp/app/index.html';
      //var file = fs.readFileSync(indexFullPath , 'utf8');
     // file = file.replace(/ui-view="navbar"/g, 'sidebar');
      //file = file.replace(/class="dropdown-toggle" data-toggle="dropdown"/g, 'dropdown-toggle');
     // fs.writeFileSync(indexFullPath , file);
    }
  },
  install: function () {

    var injectJsFilesToIndex = function () {
      this.log('\n' + chalk.bold.green('Running gulp Inject to add javascript to index\n'));
      this.spawnCommand('gulp', ['inject']);
    };

    var injectDependenciesAndConstants = function () {
      this.spawnCommand('gulp', ['install']);
    };

    this.installDependencies({
      bower: true,
      npm: false,
      callback: injectDependenciesAndConstants.bind(this)
    });

    if (!this.options['skip-install'] && !this.skipClient) {
      injectJsFilesToIndex.call(this);
    }
  },
  end: function() {
    if (this.useSass) {
        this.log('\n' + chalk.bold.green('You are using SASS! Please make sure to check the documentation on using SASS'));
     }
   }
});
