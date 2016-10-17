'use strict';

angular.module('notify.services',['ngResource'])
.constant("baseURL","http://192.168.1.78:8000/api/")

.factory('$localStorage',['$window', function($window){
      return {
        store: function(key, value) {
          $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
          return $window.localStorage[key] || defaultValue;
        },
        storeObject: function(key, value) {
          $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key,defaultValue) {
          return JSON.parse($window.localStorage[key] || defaultValue);
        }
      }
}])

.factory('noticeFactory',['$http','baseURL','$localStorage',function($http,baseURL,$localStorage){
    //var notices = [
    //    {id:1,date:new Date(), subject:'This is a test notice one', message:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'},
    //    {id:2,date:new Date(), subject:'This is a test notice two', message:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'},
    //    {id:3,date:new Date(), subject:'This is a test notice three', message:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'},
    //    {id:4,date:new Date(), subject:'This is a test notice four', message:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'},
    //    {id:5,date:new Date(), subject:'This is a test notice five', message:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'}
    //];
    return {
        getNotices : function(){
            return $localStorage.getObject('notices','[]');
        },
        getNoticeById: function(id){
            var returnNotice;
            var notices = $localStorage.getObject('notices','[]');
            angular.forEach(notices,function(notice,index){
                if(notice.id === id){
                    returnNotice = notice;
                }
            }); 
            return returnNotice;
        },
        getFreshNotice: function(){
            var targeturl = baseURL + 'notice';
            return $http.get(targeturl);
        }
    }
}])
.factory('attendanceFactory',["$http","baseURL",function($http,baseURL){
    var dummydata = {
        sections: [
            { id: 1, name: "EMBA Spring 2016" },
            { id: 2, name: "MBA Spring 2016" },
            { id: 3, name: "EMBA Fall 2016" },
            { id: 4, name: "MBA Fall 2016" },
        ],
        subjects: [
            { id: 1, name: "Microeconomic Analysis", code: "501", section: 1 },
            { id: 2, name: "Microeconomic Analysis", code: "501", section: 3 },
            { id: 3, name: "Business Statistics", code: "502", section: 2 },
            { id: 4, name: "Business Statistics", code: "502", section: 4 }
        ],
        students: [
            { id: 1, firstName: 'Yogesh', lastName: 'Adhikari', email: 'adhikari.yogesh@gmail.com', phone: '9808371434', section: 1 },
            { id: 2, firstName: 'Lunish', lastName: 'Yakami', email: 'a.f@gmail.com', phone: '9808371434', section: 1 },
            { id: 3, firstName: 'Ujjwal', lastName: 'Silwal', email: 'b.g@gmail.com', phone: '9808371434', section: 1 },
            { id: 4, firstName: 'Manjila', lastName: 'Bhandari', email: 'c.h@gmail.com', phone: '9808371434', section: 1 },
            { id: 5, firstName: 'Gautam', lastName: 'Manandhar', email: 'd.i@gmail.com', phone: '9808371434', section: 1 },
            { id: 6, firstName: 'Rakshya', lastName: 'Pandeya', email: 'e.j@gmail.com', phone: '9808371434', section: 1 }
        ]
    };
    return {
        getStudents : function(sectionId){
            var targeturl = baseURL + 'student/' + id;                         
            return $http.get(targeturl);
        },
        getSubjects : function(sectionId){
            var targeturl = baseURL + 'subject/' + sectionId;
            return $http.get(targeturl);
        },
        getSections : function(){
            var targeturl = baseURL + 'section';     
            return $http.get(targeturl).then(function(response){
                var sections = response.data.sections;
                return sections;
            },function(response){
                return [];
            });
        },
        saveAttendance: function (attendance) {
            var targeturl = baseURL + 'attendance/add';
            return $http.post(targeturl,attendance);
        },
        isAttedanceMarked : function(attendance){
            var targeturl = baseURL + 'attendance';
            return $http.post(targeturl,attendance);
        }
    }
}])

.factory('authenticationFactory',['$http','$localStorage','baseURL',function($http,$localStorage,baseURL){
    return {
        hasValidQR : function(){
            return $localStorage.get('rootUrl','') === baseURL;
        },
        verifyScan : function(scannedData){
            return scannedData === baseURL;
        },
        saveSubscription: function(subscription){
            var targeturl = baseURL + 'subscription';
            return $http.post(targeturl,subscription);
        },
        login: function(userInfo){
            var targeturl = baseURL + 'auth/login';
            return $http.post(targeturl, userInfo);
        }
    }
}])
;