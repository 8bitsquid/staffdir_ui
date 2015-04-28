angular.module('ualib.staffdir')

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/staffdir', {
            controller: 'StaffDirCtrl',
            templateUrl: 'staff-directory/staff-directory.tpl.html',
            resolve: {
                StaffDir: ['StaffFactory', '$filter', function(StaffFactory, $filter){
                    var staff = {
                        list: [], // Array for directory listing
                        facets: {} //Object for available facets
                    };

                    return StaffFactory.directory().get()
                        .$promise.then(function(data){
                            // Build new object of only subject that currently have a subject/research expert
                            var subj = [];
                            angular.forEach(data.list, function(val){
                                if (angular.isDefined(val.subjects) && val.subjects.length > 0){
                                    angular.forEach(val.subjects, function(subject){
                                        subj.push(subject);
                                    });
                                }
                            });
                            subj = $filter('unique')(subj, 'subject');
                            subj = $filter('orderBy')(subj, 'subject');
                            staff.facets.subjects = subj;
                            // get list of people
                            staff.list = data.list;

                            return staff;
                        }, function(data, status){
                            console.log('Error' + status + ': ' + data);
                            return staff;
                        });
                }]
            }
        });
    }])

    .controller('StaffDirCtrl', ['$scope', 'StaffDir', function($scope, StaffDir){
        $scope.staffdir = StaffDir;
    }])

    .directive('staffDirectoryListing', ['StaffDirectoryService', function(SDS){
        return {
            restrict: 'AC',
            scope: {
                list: '=',
                sortBy: '@'
            },
            templateUrl: 'staff-directory/staff-directory-listing.tpl.html',
            controller: function($scope, $element){
                $scope.staffdir = SDS;

                SDS.sortBy = angular.isDefined($scope.sortBy) ? $scope.sortBy : 'lastname';
                SDS.sortable = $scope.sortable;

                // Not good practice, but done for brevity's sake
                // TODO: have sort functions event listeners defined in linking function and not via ng-click
                $scope.sortList = function(ev, column){
                    ev. preventDefault();

                    if (SDS.sortBy === column){
                        SDS.sortReverse = !SDS.sortReverse;
                    }
                    else {
                        SDS.sortBy = column;
                        SDS.sortReverse = false;
                    }
                };
            }
        };
    }])

    .directive('staffDirectoryFacets', ['StaffDirectoryService', function(SDS){
        return {
            restrict: 'AC',
            scope: {
                facets: '='
            },
            templateUrl: 'staff-directory/staff-directory-facets.tpl.html',
            controller: function($scope){
                $scope.staffdir = SDS;

                $scope.clearFacet = function(){
                    var copy = {};
                    var omitKeys = Array.prototype.concat.apply(Array.prototype, arguments);

                    Object.keys(SDS.facet).map(function(key){
                        if (omitKeys.indexOf(key) === -1) {
                            copy[key] = SDS.facet[key];
                        }
                    });
                    SDS.facet = copy;

                };
            }
        };
    }]);