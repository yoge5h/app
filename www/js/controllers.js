angular.module('notify.controllers', ['ngCordova'])

.controller('AppCtrl', ['$scope', '$ionicModal', '$timeout','$localStorage'
,function($scope, $ionicModal, $timeout,$localStorage) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = $localStorage.getObject('userinfo','{}');
  $scope.reservation = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
	$localStorage.storeObject('userinfo',$scope.loginData);
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
    
  $scope.displayAttendance = function(){
    //check if the token exists
    return true;  
  };
}])


.controller('NoticeController',['$scope','notices','$timeout','isVerified'
,function($scope,notices,$timeout,isVerified){
    $scope.notices = notices;
    $scope.doRefresh = function() {
        //$http.get('/new-items')
        // .success(function(newItems) {
        //   $scope.items = newItems;
        // })
        // .finally(function() {
        //   // Stop the ion-refresher from spinning
        //   $scope.$broadcast('scroll.refreshComplete');
        // });
        $timeout(function() {
         $scope.$broadcast('scroll.refreshComplete');
        }, 2000);
    };
    $scope.isVerified = isVerified;
}])
.controller('AboutController',['$scope',function($scope){
    
}])
.controller('NoticeDetailController',['$scope','notice',function($scope,notice){
    $scope.notice = notice
}])
.controller('AttendanceController',['$scope','$ionicModal','$ionicPopover','sections','subjects','attendanceFactory'
,function($scope,$ionicModal,$ionicPopover,sections,subjects,attendanceFactory){
    $scope.attendance = {
        date: new Date(),
        students:[]
    };
    
    $scope.students = [];
    $scope.subjects = subjects;
    $scope.sections = sections;
    
    $scope.getStudents = function () {
        //check if attendance already exists for the day the subject.
        $scope.students = attendanceFactory.getStudents($scope.attendance.section);
        $scope.closeSelectSection();
    };
   
	$ionicPopover.fromTemplateUrl('templates/attendance-popover.html', {
		scope: $scope
	  }).then(function(popover) {
		$scope.popover = popover;
	});
    $scope.closeSelectSection = function() {
        $scope.attendanceModal.hide();
    };	
	$scope.openPopover = function($event) {	
      $scope.popover.show($event);
    };
   
	$scope.closePopover = function() {
        if(typeof $scope.popover !== 'undefined')
            $scope.popover.hide();
	};    
    
    $scope.selectSection = function(){
        $ionicModal.fromTemplateUrl('templates/attendancePopup.html', {
            scope: $scope
          }).then(function(modal) {
            $scope.attendanceModal = modal;
            $scope.attendanceModal.show();
        });        
        $scope.closePopover();
    }
    $scope.selectSection();
}])
.controller('SettingsController',['$scope','sections','isVerified','$cordovaBarcodeScanner','$localStorage','authenticationFactory'
,function($scope,sections,isVerified,$cordovaBarcodeScanner,$localStorage,authenticationFactory){
    $scope.sections = sections;
    $scope.isVerified = isVerified;
    $scope.settings = {
        sectionId : parseInt($localStorage.get('subscribedSection','-1'))
    };
    $scope.saveSubscription = function(){
        $scope.settings.deviceId = $localStorage.get('deviceId','');
        console.log($scope.settings);
        authenticationFactory.saveSubscription($scope.settings).then(function(response){
            alert('Subscription set successfully');
            $localStorage.store('subscribedSection',$scope.settings.sectionId);
        },function(response){
            alert('An error occured. Please check your connection and try again later.');
        });
    };
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            //alert(imageData.text);
            //console.log("Barcode Format -> " + imageData.format);
            //console.log("Cancelled -> " + imageData.cancelled);
            if(authenticationFactory.verifyScan(imageData.text)){
                $localStorage.store('rootUrl',imageData.text);
                alert('QR code verified.');
            }
            else{
                 alert('Invalid QR code');
            }
        }, function(error) {
            alert('An error occured. Please try again.');
        });
    };    
}])
.directive('convertToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (val) {
                return val != null ? parseInt(val, 10) : null;
            });
            ngModel.$formatters.push(function (val) {
                return val != null ? '' + val : null;
            });
        }
    };
});


