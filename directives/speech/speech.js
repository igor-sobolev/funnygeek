angular.module('funnyGeek')
  .directive('speech', ['$window', '$rootScope', '$http', 'HOST', '$timeout',
   function ($window, $rootScope, $http, HOST, $timeout) {

      var speakers = [];
      $rootScope.messages = {};

      var recognition = new $window.webkitSpeechRecognition();
      recognition.stop();
      recognition.continuous = true;
      $rootScope.$on('langGot', function () {
        recognition.lang = $rootScope.lang;
      });
      recognition.interim = true;

      recognition.onresult = function (event) {
        var final = '';
        var interim = '';
        for (var i = 0; i < event.results.length; ++i) {
          if (event.results[i].final) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        console.log('question: ' + interim);
        recognition.stop();
        getAnswer(interim);
      };

      recognition.onerror = function () {
        $rootScope.$broadcast('endedListening');
        recognition.stop();
      };

      function getAnswer(str) {
        if (!$rootScope.bot) return;
        $rootScope.messages.qw = str;
        $http.get(HOST + $rootScope.bot + '/answer?q=' + str + '&l=' +
            $rootScope.lang)
          .success(function (data) {
            say(data.answer);
            $rootScope.messages.ans = data.answer;
          })
          .error(function () {
            recognition.start();
          });
      }

      function say(phrase) {
        console.log(phrase + ' fired!');
        var u = new $window.SpeechSynthesisUtterance();
        u.text = phrase;
        u.lang = $rootScope.lang;
        u.voiceURI = 'native';
        u.volume = 0.9; // 0 to 1
        u.rate = 0.8; // 0.1 to 10

        u.onstart = function () {
          $rootScope.$broadcast('speakStart');
        };

        u.onend = function () {
          $rootScope.$broadcast('speakEnd');
        };

        speakers.push(u);

        $timeout(function () {
          $window.speechSynthesis.speak(u);
        }, 100);
      }

      var isLang = false;
      var isBot = false;

      function inspectOptionsAndStart() {
        $rootScope.$on('langGot', function () {
          isLang = true;
        });
        $rootScope.$on('botGot', function () {
          isBot = true;
        });
        $rootScope.$watch(function () {
          return isLang && isBot;
        }, function () {
          if (isLang && isBot) $rootScope.$broadcast('geekStart');
        });
      }

      return {
        restrict: 'A',
        controller: 'SpeechController',
        link: function (scope, element) {
          inspectOptionsAndStart();
          $rootScope.$on('geekStart', function () {
            recognition.start();
          });
          $rootScope.$on('speakStart', function () {
            element.addClass('speaking');
          });
          $rootScope.$on('speakEnd', function () {
            element.removeClass('speaking');
            recognition.start();
          });
          $rootScope.$on('restartListening', function () {
            recognition.stop();
            $timeout(function () {
              recognition.start();
            }, 1000);
          });
        }
      };

}]);

angular.module('funnyGeek')
  .controller('SpeechController', ['$scope', '$rootScope', function ($scope,
    $rootScope) {

    $rootScope.$watch(function () {
      return $rootScope.messages.qw;
    }, function () {
      $scope.qw = $rootScope.messages.qw;
    });
    $rootScope.$watch(function () {
      return $rootScope.messages.ans;
    }, function () {
      $scope.ans = $rootScope.messages.ans;
    });

  }]);