'use strict';

angular.module('funnyGeek', ['ngAnimate'])
  .controller('mainCtrl', ['$scope', '$rootScope',
   function ($scope, $rootScope) {

      $scope.$watch(function () {
          return $scope.lang;
        },
        function () {
          if (!$scope.lang) return;
          $rootScope.lang = $scope.lang;
          $rootScope.$broadcast('langGot');
        });

      $scope.$watch(function () {
          return $scope.bot;
        },
        function () {
          if (!$scope.bot) return;
          $rootScope.bot = $scope.bot;
          $rootScope.$broadcast('botGot');
        });

      /**
       * Checks if app supports speech API
       * @return {Boolean} True if supports
       */
      $scope.isSupport = function () {
        return 'webkitSpeechRecognition' in window &&
          'SpeechSynthesisUtterance' in window && 'speechSynthesis' in
          window;
      };

      /**
       * Restart recognition
       */
      $scope.restart = function () {
        $rootScope.$broadcast('restartListening');
      };

      console.log('Support: ' + $scope.isSupport());

}]);