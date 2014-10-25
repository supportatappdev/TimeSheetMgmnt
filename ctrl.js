
	'use strict';
	var app = angular.module('TimeSheetMgmnt');

	app.controller('IndexCtrl', ['$rootScope','$scope','$timeout', '$location', 'DropDownFactory','RESTService',  'Cache','GetFactoryAPI',  function ($rootScope,$scope,$timeout, $location,DropDownFactory,RESTService,  Cache,GetFactoryAPI) {
	    $rootScope.selection = 'MainPage';
	    $rootScope.gohome = function() {
	         $rootScope.selection = 'MainPage';
		        $location.path('/');
	    };
	   
	    
           var a = Cache.get('_projlist');
	        var c, _limit = 20, $this = this;
            function init() { 
    		a.projlist = {};
    		  GetFactoryAPI.getProjects(function(result){
    		 a.projlist.data = result;   
    		});
    		a.selection = 'ProjList';
    		a.projlist.offset = 0;	
    		a.projlist.initialized = false;
    		a.projlist.hasMore = false;
    		a.projlist.loading = false;
    	
    		$scope.a = a;
    		
    		$this.initGrid();/*
    		$timeout(function() {
    		    console.info("*******"+ProjectList.getProjects());
    		
    		},2000);*/
    	} 

	    $scope.tabs = [
                { title:'Dynamic Title 1', content:'Dynamic content 1' },
                { title:'Dynamic Title 2', content:'Dynamic content 2', disabled: true }
              ];
            
              $scope.alertMe = function() {
                setTimeout(function() {
                  alert('You\'ve selected the alert tab!');
                });
              };   
                  
                 
        $scope.cellSelectEditableTemplate = "<select  ng-class=\"'colt' + col.index\" ng-input=\"COL_FIELD\" ng-model=\"COL_FIELD\"  ng-options=\"item.proj_id as item.PROJECT_NAME for item in a.projlist.data\" ng-blur=\"updateEntity(row)\" />";             
          this.initGrid = function() {
              $scope.myDefs = [{ field: 'proj_id', displayName: 'Project', enableCellEditOnFocus: true,width: 250, editableCellTemplate: $scope.cellSelectEditableTemplate,cellFilter:'mapProjectName'},
        { field: 'activity', displayName: 'Activity', enableCellEditOnFocus: true,width: 250  , editableCellTemplate: $scope.cellSelectEditableTemplate},
        { field: 'day1', displayName: 'Day1', enableCellEdit: true,width:50 },
        { field: 'day2', displayName: 'Day2', enableCellEdit: true,width:50 },
        { field: 'day3', displayName: 'Day3', enableCellEdit: true,width:50 },
        { field: 'day4', displayName: 'Day4', enableCellEdit: true,width:50 },
        { field: 'day5', displayName: 'Day5', enableCellEdit: true,width:50 },
        { field: 'day6', displayName: 'Day6', enableCellEdit: true,width:50 },
        { field: 'day7', displayName: 'Day7', enableCellEdit: true,width:50 },];
 
              
       //grid rendering..
        $scope.myData = [{},{},{},{},{},{},{},{},{}];
                $scope.gridOptions = { 
                    enableRowSelection: false,
                     enableCellEditOnFocus: true,
                     showTitleBar:true,
                     titleName:'TimeSheet',
                    data: 'myData',
                      columnDefs: 'myDefs'
                };
          }
          
          
                  
          $scope.updateEntity = function(row) {
            if(!$scope.save) {
              $scope.save = { promise: null, pending: false, row: null };
            }
            $scope.save.row = row.rowIndex;
            if(!$scope.save.pending) {
              $scope.save.pending = true;
              $scope.save.promise = $timeout(function(){
                // $scope.list[$scope.save.row].$update();
                console.log("Here you'd save your record to the server, we're updating row: " 
                            + $scope.save.row + " to be: " 
                            + a.projlist.data[$scope.save.row].proj_id + "," 
                            + a.projlist.data[$scope.save.row].PROJECT_NAME );
                $scope.save.pending = false; 
              }, 500);
            }    
          };
        
        if (a === undefined) {
	   	a = {'pageTitle':'ProjList'};
		Cache.put('_projlist', a);
	    }
 
	    init();
        
        	
    	}]);
    	  
    	
app.filter('mapProjectName', function(Cache ) {
  return function(input) {
     var projs = Cache.get('_projlistx');    
        //console.log("***** From filter 123 XXX******"+projs);
        for(var cnt = 0; cnt < projs.length; cnt++) {
            if(projs[cnt].proj_id === input) {
           // console.log("***** From filter 123******"+input);
            return projs[cnt].PROJECT_NAME;    
            
            }
      
        }
    
      /*for(var counter = 0 ; counter < projs.length; counter++) {
        if (projs[counter][input]) {
          return projs[counter][input];
        } else {
          return '';
        }   
      }*/
  };
})    	
   

app.factory( 'GetFactoryAPI', function(Cache,RESTService) {
  return {
      
      getTasksByProject: function(projId,callback) {
          	RESTService.query({'method':'data'}, {'ds':'GetTaskResourceRef1','limit':_limit,'offset':a.tasklist.offset,'wC':'proj_id = ?','params':[projId], 'executeCountSql': 'N'},
			function(result){
					if (result.$error) {
						Logger.showAlert(result.errorMessage, result.errorTitle);
					} else {
                        console.log(result.data);
						if (result.data.length > 0) {
							a.tasklist.data.push.apply(a.tasklist.data, result.data);
							if (result.data.length < _limit) {
								a.tasklist.hasMore = false;
							} else {
								a.tasklist.hasMore = true;
							}
						} else {
							a.tasklist.hasMore = false;
							console.log("No Records found!!");
						}
						Cache.put('_tasklist', a);
					}
					a.tasklist.loading = false;
				}
			); 
      },
      getProjects: function(callback) {
         // console.info("*****"+Cache.get('_projlistx')+"*****");
          var _callback = callback;
          if(typeof Cache.get('_projlistx') !== 'undefined') {
              _callback(Cache.get('_projlistx'));
          } else {
          RESTService.query({'method':'data'}, {'ds':'GetCustProjRef','limit':30,'offset':0, 'executeCountSql': 'N'},
			function(result){
			      var _projects;
					if (result.$error) {
						console.error(result.errorMessage, result.errorTitle);
					} else {
              			if (result.data.length > 0) {
						   _projects = result.data;
						  console.info("Queried to server");
						   console.log(_projects);
						  Cache.put('_projlistx', _projects);
						} else {
							console.log("No Records found!!");
						}
					}
						//return _projects;
						_callback(result);
					
				}
			);
          }
  }
}
});    	
	
	  