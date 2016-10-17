// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('notify', ['ionic', 'notify.controllers','notify.services','ngCordova'])

.run(['$ionicPlatform','$rootScope','$ionicLoading','$localStorage','$cordovaPushV5','$ionicPopup','$state','$ionicHistory'
,function($ionicPlatform,$rootScope,$ionicLoading,$localStorage,$cordovaPushV5,$ionicPopup,$state,$ionicHistory) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.backgroundColorByHexString("#243da0");//.styleDefault();
    }
	
	$rootScope.$on('loading:show', function () {
		$ionicLoading.show({
			template: '<ion-spinner></ion-spinner> Loading ...'
		})
    });

    $rootScope.$on('loading:hide', function () {
        $ionicLoading.hide();
    });

    //$rootScope.$on('$stateChangeStart', function () {
    //    console.log('state change start ...');
    //    //$rootScope.$broadcast('loading:show');
    //});
//
//    $rootScope.$on('$stateChangeSuccess', function () {
//        console.log('state change end ...');
//        //$rootScope.$broadcast('loading:hide');
//    });
      
    //back button config
   $ionicPlatform.registerBackButtonAction(function(event) {
    if(!$state.includes("app.noticeDetails")){
      $ionicPopup.confirm({
        title: 'Warning',
        template: 'Are you sure you want to exit?'
      }).then(function(res) {
        if (res) {
          ionic.Platform.exitApp();
        }
      })
    }
   else{
       $ionicHistory.goBack();
   }
   }, 100);
      
    //Push notification config
     var options = {
        android: {
          senderID: "83298274209",
          icon:'ic_stat_entypo_d83d0_1024',
          forceShow: "true"
        },
        ios: {
          alert: "true",
          badge: "true",
          sound: "true"
        },
        windows: {}
      };
      
  // initialize
  $cordovaPushV5.initialize(options).then(function() {
    // start listening for new notifications
    $cordovaPushV5.onNotification();
    // start listening for errors
    $cordovaPushV5.onError();
    
    // register to get registrationId
    $cordovaPushV5.register().then(function(registrationId) {
      $localStorage.store('deviceId',registrationId);
    })
  });
  
  // triggered every time notification received
  $rootScope.$on('$cordovaPushV5:notificationReceived', function(event, data){
    // data.message,
    // data.title,
    // data.count,
    // data.sound,
    // data.image,
    // data.additionalData
      alert(data.message);
  });

  // triggered every time error occurs
  $rootScope.$on('$cordovaPushV5:errorOcurred', function(event, e){
    // e.message
  });      
	
  });
}])

.config(function($stateProvider, $urlRouterProvider,$httpProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/sidebar.html',
    controller: 'AppCtrl'
  })

  .state('app.notice', {
    url: '/notice',
    views: {
      'mainContent': {
        templateUrl: 'templates/notice.html',
		controller: 'NoticeController',
        resolve: {
            notices:  ['noticeFactory', function(noticeFactory){
                return noticeFactory.getNotices();
             }],
			isVerified:['authenticationFactory', function(authenticationFactory){
				return authenticationFactory.hasValidQR();
			}]
        }
      }
    }
  })

  .state('app.aboutus', {
      url: '/aboutus',
      views: {
        'mainContent': {
          templateUrl: 'templates/aboutus.html',
		  controller: 'AboutController'
        }
      }
  })

  .state('app.noticeDetails', {
    url: '/notice/:id',
    views: {
      'mainContent': {
        templateUrl: 'templates/noticeDetail.html',
        controller: 'NoticeDetailController',
        resolve: {
            notice: ['$stateParams','noticeFactory', function($stateParams, noticeFactory){
                return noticeFactory.getNoticeById(parseInt($stateParams.id, 10));
            }]
        }
      }
    }
  })
  .state('app.attendance', {
      url: '/attendance',
      views: {
        'mainContent': {
            controller:'AttendanceController',
            templateUrl: 'templates/attendance.html',
            resolve:{
                subjects: ['attendanceFactory', function(attendanceFactory) {
                      return attendanceFactory.getSubjects();
                  }],
                sections:  ['attendanceFactory', function(attendanceFactory){
                    return attendanceFactory.getSections();
                }]
            }
        }
      }
    })
	.state('app.settings', {
	  url: '/settings',
	  views: {
		'mainContent': {
		  controller: 'SettingsController',
		  templateUrl: 'templates/settings.html',
		  resolve:{
			sections: ['attendanceFactory', function(attendanceFactory) {
                  return attendanceFactory.getSections();
              }],
              isVerified:['authenticationFactory', function(authenticationFactory){
				  return authenticationFactory.hasValidQR();
			  }]         
			
		  }
		}
	  }
	});
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/notice');

  $httpProvider.interceptors.push(function($rootScope, $injector, $q) {
        return {
            request: function(config) {
              $rootScope.$broadcast('loading:show');
              return config
            },
            response: function(response) {
              var $http = $http || $injector.get('$http');
              if($http.pendingRequests.length < 1) {
                $rootScope.$broadcast('loading:hide');
              }
              return response;
            },
            requestError: function(rejectReason) {
              $rootScope.$broadcast('loading:hide');
              return $q.reject(rejectReason);
            },
            responseError: function(rejectReason) {
              $rootScope.$broadcast('loading:hide');
              return $q.reject(rejectReason);
            }
        }
    });
});
