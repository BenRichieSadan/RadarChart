
mod.controller('stylerController', ['$scope',
    function ($scope) {

        /**
         * variables
         */


        /**
         * watches
         */
        $scope.$watch('widget', function (val) {

            $scope.model = $$get($scope, 'widget.style');
        });

        $scope.isRoundStrokesTick = function (val) {
            $scope.model.isRoundStrokes = val;//!$scope.model.isRoundStrokes;
            _.defer(function () {
                $scope.$root.widget.redraw();
            });
        };

        /**
         * public methods
		*/
    }
]);