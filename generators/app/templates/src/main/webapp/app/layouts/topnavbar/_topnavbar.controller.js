(function() {
  'use strict';

  angular
    .module('<%=angularAppName%>')
    .controller('TopNavBarController', TopNavBarController);

  TopNavBarController.$inject = ['$state', 'Auth', 'Principal', 'ProfileService', 'LoginService'];

  function TopNavBarController ($state, Auth, Principal, ProfileService, LoginService) {
    var vm = this;

    vm.isAuthenticated = Principal.isAuthenticated;

    ProfileService.getProfileInfo().then(function(response) {
      vm.inProduction = response.inProduction;
      vm.swaggerEnabled = response.swaggerEnabled;
    });

    vm.login = login;
    vm.logout = logout;
    //vm.toggleSidebar = toggleSidebar;
   // vm.collapseSidebar = collapseSidebar;

    vm.$state = $state;

    function login()   {
    //  collapseSidebar();
      LoginService.open();
    }

    function logout() {
     // collapseSidebar();
      Auth.logout();
      $state.go('home');
    }

    //function toggleSidebar() {
     // vm.isSidebarCollapsed = !vm.isSidebarCollapsed;
    //}

    //function collapseSidebar() {
     // vm.isSidebarCollapsed = true;
    //}

  }
})();
