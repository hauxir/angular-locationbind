(function(window, angular, undefined) {
'use strict';

angular.module( 'ngLocationBind',[])
.factory( '$locationbind', [ '$location',
function($location) {
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
                        var par = $scope;
                        var lastbracket = key.lastIndexOf("[");
                        var lastdot = key.lastIndexOf(".");
                        if(lastdot > lastbracket) {
                             if(typeof val == "string") {
                                val = "'" + val + "'";
                             }
                             var childkey = key.substring(lastdot);
                             par = "$scope." + key.substring(0,lastdot);
                             eval(par + childkey + "=" + val + ";");
                        }
                        else if(lastbracket != -1) {
                             if(typeof val == "string") {
                                val = "'" + val + "'";
                             }
                             var childkey = key.substring(lastbracket);
                             par = "$scope." + key.substring(0,lastbracket);
                             eval(par + childkey + "=" + val + ";");
                        } else {
                            $scope[key] = val;
                        }
                    }
                    else if(getparams[key] != old[key]) {
                        window.location.reload();
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
                        return eval("$scope." + name);
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
