(function(window, angular, undefined) {
'use strict';

angular.module( 'ngLocationBind',[])
.factory( '$locationbind', [ '$location','$route',
function($location, $route) {
    return function ($scope,names) {
        var watched_vars = {};
        names.map(function(name) {
            watched_vars[name] = true;
        });

        //LOCATION TO SCOPE
        $scope.$watch(
            function() {
                return $location.search();
            },
            function(getparams,old) {
                for(var key in watched_vars) {
                    if(getparams[key]) {
                        var val = getparams[key];

                        try {
                            val = angular.fromJson(val);
                        } catch(SyntaxError) {
                            //ignore, maybe its just a string
                        }

                        var item = $scope;
                        var hierarchy = key.split(".");
                        while(hierarchy.length > 1) {
                            item = item[hierarchy.shift()];
                        }

                        item[hierarchy.shift()] = val;
                    }
                    else if(getparams[key] != old[key]) {
                        $route.reload();
                    }
                }
            },
            true
        );

        //SCOPE to LOCATION
        $scope.$watch(
            function() {
                return angular.toJson(
                    names.map(function(name) {
                        var item = $scope;
                        var hierarchy = name.split(".");
                        while(hierarchy.length > 1) {
                            item = item[hierarchy.shift()];
                        }
                        return item[hierarchy.shift()];
                    })
                );
            },
            function(val,old) {
                val = angular.fromJson(val);
                old = angular.fromJson(old);
                for(var i in names) {
                    var key = names[i];
                    var value = val[i];
                    var oldvalue = old[i];

                    if(typeof val == "object") {
                        value = angular.toJson(value);
                        oldvalue = angular.toJson(oldvalue);
                    }

                    if( value != oldvalue) {
                        $location.search(key, value);
                    }
                }
            },
        true);
    };
 }]);

})(window, window.angular);
