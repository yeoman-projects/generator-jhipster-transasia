'use strict';
var yeoman = require('yeoman-generator'),
 chalk = require('chalk'),
 packagejs = require(__dirname + '/../../package.json'),
 cheerio = require('cheerio'),
 file_sys = require('fs'),
 yosay = require('yosay');



// Stores JHipster variables
var jhipsterVar = {moduleName: 'transasia'};

// Stores JHipster functions
var jhipsterFunc = {};

var STRIP_HTML = 'stripHtml',
    STRIP_JS = 'stripJs',
    COPY = 'copy',
    TPL = 'template',
    VERSION_THEME = '1.0'

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
      this.log(chalk.white('Welcome to the ' + chalk.bold('JHipster Transasia theme') + ' Module! ' + chalk.yellow('v' + packagejs.version + '\n')));
    }
  },
  prompting: function () {

    var done = this.async();

    var prompts = [
      {
       type: 'confirm',
       name: 'confirm',
       message: 'Enable Transasia corporate style?',
       default: true
      },
      {
        type: 'input',
        name: 'message',
        message: 'Enable MS-SQL support in your JHipster app? (Y/n)',
        default: 'n'
      }
    ];

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

      this.frontendBuilder = jhipsterVar.frontendBuilder;
      this.useSass = jhipsterVar.useSass;

      this.enableTranslation = jhipsterVar.enableTranslation;


      // Add AngularJs config
     // jhipsterFunc.copyTemplate(this.webappDir + '/app/content/css/_main.css', this.webappDir + '/app/content/css/transasia.css', 'template', this, null, true);




      // --- Grab from MSSQL module --- //
      this.message = this.props.message.toUpperCase();
      this.changelogHeader = '<databaseChangeLog' +
        '\n    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"' +
        '\n    xmlns:ext="http://www.liquibase.org/xml/ns/dbchangelog-ext"' +
        '\n    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
        '\n    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.4.xsd' +
        '\n    http://www.liquibase.org/xml/ns/dbchangelog-ext http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-ext.xsd">';

      this.changelogLoadData = '<ext:loadData encoding="UTF-8"' +
        '\n                  file="config/liquibase/users.csv"' +
        '\n                  separator=";"' +
        '\n                  tableName="jhi_user"' +
        '\n                  identityInsertEnabled="true">'+
        '\n            <column name="activated" type="boolean"/>' +
        '\n            <column name="created_date" type="timestamp"/>' +
        '\n        </ext:loadData>' +
        '\n        <dropDefaultValue tableName="jhi_user" columnName="created_date" columnDataType="datetime"/>' +
        '\n' +
        '\n        <ext:loadData encoding="UTF-8"' +
        '\n                  file="config/liquibase/authorities.csv"' +
        '\n                  separator=";"' +
        '\n                  tableName="jhi_authority"' +
        '\n                  identityInsertEnabled="true" />'+
        '\n' +
        '\n        <ext:loadData encoding="UTF-8"' +
        '\n                  file="config/liquibase/users_authorities.csv"' +
        '\n                  separator=";"' +
        '\n                  tableName="jhi_user_authority"' +
        '\n                  identityInsertEnabled="true" />';

      this.changelogDateSettings = '<property name="now" value="GETDATE()" dbms="mssql"/>';
      this.changelogAutoIncrementSettings = '<property name="autoIncrement" value="true" dbms="mssql, mysql,h2,postgresql,oracle"/>';

      this.applicationDatasource = 'datasource:' +
        '\n        url: jdbc:sqlserver://' +
        '\n        username: ' +
        '\n        password: ' +
        '\n    jpa:' +
        '\n        database-platform: org.hibernate.dialect.SQLServerDialect' +
        '\n        database: SQL_SERVER' +
        '\n        show_sql:';

      if(this.message == 'Y'){
        //    Check for MS SQL Server JDBC in pom and add it if missing

        jhipsterFunc.addMavenDependency('com.microsoft.sqlserver','sqljdbc42','4.2');
        jhipsterFunc.addMavenDependency('com.github.sabomichal','liquibase-mssql','1.5');

        jhipsterFunc.replaceContent(this.resourceDir + 'config/application-prod.yml', 'datasource[\\s\\S]*show_sql:', this.applicationDatasource, true);

        //  Add ext to databaseChangeLog XML schema in 00000000000000_initial_schema.xml
        jhipsterFunc.replaceContent(this.resourceDir + 'config/liquibase/changelog/00000000000000_initial_schema.xml', '<databaseChangeLog[\\s\\S]*3.4.xsd">', this.changelogHeader, true);

        //  Add settings for MSSQL Dates and Autoincrement
        jhipsterFunc.replaceContent(this.resourceDir + 'config/liquibase/changelog/00000000000000_initial_schema.xml', '<property name="now" value="current_timestamp" dbms="postgresql"/>', '<property name="now" value="current_timestamp" dbms="postgresql"/>\n    <property name="now" value="GETDATE()" dbms="mssql"/>');
        jhipsterFunc.replaceContent(this.resourceDir + 'config/liquibase/changelog/00000000000000_initial_schema.xml', '<property name="autoIncrement" value="true" dbms="mysql,h2,postgresql,oracle"/>', '<property name="autoIncrement" value="true" dbms="mssql,mysql,h2,postgresql,oracle"/>');

        //  Add ext prefix and identityInsertEnabled="true" attribute to loadData
        jhipsterFunc.replaceContent(this.resourceDir + 'config/liquibase/changelog/00000000000000_initial_schema.xml', '<loadData[\\s\\S]*authority"/>', this.changelogLoadData, true);
      }

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
      jhipsterFunc.addBowerDependency('font-awesome', 'fontawesome#^4.7.0');
      jhipsterFunc.addBowerDependency('arrive', '2.3.0');
      //jhipsterFunc.addBowerDependency('bootstrap-material-design', '0.5.10');

      // collect files to copy
      var files = [
        { from: this.webappDir + '/app/_favicon.ico', to: this.webappDir + '/app/favicon.ico'},
        { from: this.webappDir + '/content/css/patterns/_header-profile.png', to: this.webappDir + '/content/css/patterns/header-profile.png'},
        { from: this.webappDir + '/scss/_main.scss', to: this.webappDir + '/scss/main.scss'},
        { from: this.webappDir + '/app/_app.state.js', to: this.webappDir + '/app/app.state.js'},
        { from: this.webappDir + '/app/blocks/config/_html5.mode.config.js', to: this.webappDir + '/app/blocks/config/html5.mode.config.js'},
        { from: this.webappDir + '/app/layouts/sidebar/_sidebar.controller.js', to: this.webappDir + '/app/layouts/sidebar/sidebar.controller.js'},
        { from: this.webappDir + '/app/layouts/sidebar/_active-link.directive.js', to: this.webappDir + '/app/layouts/sidebar/active-link.directive.js'},
        { from: this.webappDir + '/app/layouts/sidebar/_active-menu.directive.js', to: this.webappDir + '/app/layouts/sidebar/active-menu.directive.js'},
        { from: this.webappDir + '/app/layouts/sidebar/_sidebar.html', to: this.webappDir + '/app/layouts/sidebar/sidebar.html'},
        { from: this.webappDir + '/app/layouts/topnavbar/_topnavbar.controller.js', to: this.webappDir + '/app/layouts/topnavbar/topnavbar.controller.js'},
        { from: this.webappDir + '/app/layouts/topnavbar/_topnavbar.directive.js', to: this.webappDir + '/app/layouts/topnavbar/topnavbar.directive.js'},
        { from: this.webappDir + '/app/layouts/topnavbar/_topnavbar.html', to: this.webappDir + '/app/layouts/topnavbar/topnavbar.html'},
        { from: this.webappDir + '/app/home/_home.html', to: this.webappDir + '/app/home/home.html'},
        { from: this.webappDir + '/app/content/_main.html', to: this.webappDir + '/app/content/main.html'},
        { from: this.webappDir + '/app/content/js/_inspinia.js', to: this.webappDir + '/app/content/js/_inspinia.js'}
      ];
      this.copyFiles(files);
    },

    updateClientSideFiles : function () {

      this.frontendBuilder = jhipsterVar.frontendBuilder;
      this.useSass = jhipsterVar.useSass;

      jhipsterFunc.rewriteFile(this.webappDir + 'index.html', '<!-- build:css content/css/main.css --> ',
        '<!-- placeholder link to load Transasia need style, title holds the current applied theme name-->\n ' +
        ' <link href="bower_components/animate.css/animate.css" rel="stylesheet">\n  ' +
        ' <link href="bower_components/font-awesome/css/font-awesome.css" rel="stylesheet">\n ');

      var html = this.fs.read(this.webappDir + 'index.html');
      var content =  this.fs.read(this.webappDir + 'app/content/main.html');

      // CSS selectors or Xpath to navigate DOM
      var $ = cheerio.load(html);
      var body =  $('body');

      var head = $('head');
      if(head.find('#html5mode').length == 0) {
        head.append('<base id="html5mode" href="/">');
      }


      body.html(content);

      var footer = $('.footer');
       if(footer.find('#btlversion').length == 0) {
           footer.append('<b id="btlversion">BTL theme ' + VERSION_THEME + '</b>\n ');
         }
      this.fs.write(this.webappDir + 'index.html', $.html());
    }
  },

  install: function () {

     var injectJsFilesToIndex = function () {
      // this.log('\n' + chalk.bold.green('Running gulp Inject to add javascript to index\n'));
      this.spawnCommand('gulp', ['inject']);
    };

    var injectDependenciesAndConstants = function () {
      this.log('\n' + chalk.bold.green('Running gulp install to add css and js dependencies to index\n'));
      this.spawnCommand('gulp', ['install']);
    };

    var compileSAAS = function () {
       this.log( chalk.bold.green('Running gulp styles\n'));
       this.spawnCommand('gulp', ['styles']);
    };


    this.installDependencies({
      bower: true,
      npm: false,
      callback: injectDependenciesAndConstants.bind(this)
    });

   if (!this.options['skip-install'] && !this.skipClient) {
       compileSAAS.call(this);
       injectJsFilesToIndex.call(this);

    }

  },
  end: function() {
    //this.log(chalk.bold.red('You will need to install the sqljdbc42.jar locally.'));
    this.log(chalk.green.bold('Transasia Theme installed successfully.\n'));
   }
});
