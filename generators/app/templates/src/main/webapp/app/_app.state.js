(function() {
  'use strict';

  angular
    .module('<%=angularAppName%>')
    .config(stateConfig);

  stateConfig.$inject = ['$stateProvider'];

  function stateConfig($stateProvider) {
    $stateProvider.state('app', {
      abstract: true,
      views: {
        'topnavbar@': {
          templateUrl: 'app/layouts/topnavbar/topnavbar.html',
          controller: 'TopNavBarController',
          controllerAs: 'vm'
        },
        'sidebar@': {
          templateUrl: 'app/layouts/sidebar/sidebar.html',
          controller: 'SideBarController',
          controllerAs: 'vm'
        },
      },
      resolve: {
        authorize: ['Auth',
          function (Auth) {
            return Auth.authorize();
          }
        ],
          translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
            $translatePartialLoader.addPart('global');
          }]
      }
  });
  }
})();
