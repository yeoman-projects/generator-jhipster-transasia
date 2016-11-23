(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('SideBarController', SideBarController);

    SideBarController.$inject = ['$scope','$state', 'Auth', 'Principal', 'ProfileService', 'LoginService'];

    function SideBarController ($scope,$state, Auth, Principal, ProfileService, LoginService) {
        var vm = this;


        vm.account = null;
        vm.isAuthenticated = Principal.isAuthenticated;




        ProfileService.getProfileInfo().then(function(response) {
            vm.inProduction = response.inProduction;
            vm.swaggerEnabled = response.swaggerEnabled;
        });

        vm.login = login;
        vm.logout = logout;
        vm.toggleSidebar = toggleSidebar;
        vm.collapseSidebar = collapseSidebar;

        vm.$state = $state;

        vm.login = LoginService.open;

        function login()   {
            collapseSidebar();
            LoginService.open();
        }

        function logout() {
            collapseSidebar();
            Auth.logout();
            $state.go('home');
        }

        function toggleSidebar() {
            vm.isSidebarCollapsed = !vm.isSidebarCollapsed;
        }

        function collapseSidebar() {
            vm.isSidebarCollapsed = true;
        }

      getAccount();

      function getAccount() {
        Principal.identity().then(function(account) {
          vm.account = account;
          vm.isAuthenticated = Principal.isAuthenticated;
        });
      }
      function register () {
        $state.go('register');
      }


    }
})();
