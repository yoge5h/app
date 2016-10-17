angular.module('notify.controllers', ['ngCordova'])

.controller('AppCtrl', ['$scope', '$ionicModal', '$localStorage','authenticationFactory'
,function($scope, $ionicModal, $localStorage,authenticationFactory) {

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
  
  $scope.login = function() {
    $scope.modal.show();
  };
  
  $scope.doLogin = function() {
    authenticationFactory.login($scope.loginData).then(function(response){
        $scope.loginData.password = '';
        $localStorage.storeObject('userinfo',$scope.loginData);
        $localStorage.store('token', response.data.token);
    }, function(data){
        alert('Invalid credentials or bad connection.');
    });  
  };

  $scope.logout= function(){
      $localStorage.store('token', '');
  };
  $scope.isAuthenticated = function(){
    return $localStorage.get('token', '') !== '';  
  };
}])


.controller('NoticeController',['$scope','notices','isVerified','$rootScope','noticeFactory','$localStorage'
,function($scope,notices,$timeout,isVerified,$rootScope,$localStorage){
    $rootScope.notices = notices;
    $scope.doRefresh = function() {
        noticeFactory.getFreshNotice().then(function(response){
            $rootScope.notices = response.data.notices;
            $localStorage.storeObject('notices',response.data.notices);
        },function(response){
            alert('Could not load new notices.');
        });      
    };
    $scope.isVerified = isVerified;
}])
.controller('NoticeDetailController',['$scope','notice',function($scope,notice){
    $scope.notice = notice
}])
.controller('AttendanceController',['$scope','$ionicModal','$ionicPopover','sections','attendanceFactory'
,function($scope,$ionicModal,$ionicPopover,sections,subjects,attendanceFactory){
    $scope.attendance = {
        date: new Date(),
        students:[]
    };
    
    $scope.students = [];
    $scope.subjects = [];
    $scope.sections = sections;
    
    $scope.getSubjects = function(){
        attendanceFactory.getSubjects($scope.attendance.section).then(function(response){
            $scope.subjects = response.data.subjects;
        })
    };
    
    $scope.getStudents = function () {
        
        $scope.students = [];    
        if (typeof $scope.attendance.section == 'undefined') {
            alert('Please select a section.');
            return;
        }
        if (typeof $scope.attendance.subject == 'undefined') {
            alert('Please select a subject.');
            return;
        }

        var att = {
            sectionId : $scope.attendance.section,
            subjectId : $scope.attendance.subject,
            date:  $scope.attendance.date
        }
        attendanceFactory.isAttedanceMarked(att).then(function(response){
            if(!response.data.status){
                alert('Attendance for the day and subject already marked.');
                return;
            }
            else{
                attendanceFactory.getStudents($scope.attendance.section).then(function(response){
                    $scope.students = response.data.students;
                });
            }
        });
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


