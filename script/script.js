var cities = ['istanbul', 'berlin', 'london', 'helsinki', 'dublin', 'vancouver'];
var weather = [];
var citiesWeather = [];
var citiesWoeid = [];
var days = [
		'Sunday',
		'Monday',
		'Tueday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday'
	];

var app = angular.module("codelineWeather", ["ngRoute"]);
	
	app.config(function($routeProvider){
		$routeProvider.
		when("/", {
			templateUrl : 'home.htm'
		}).
		when("/home", {
			templateUrl : 'home.htm'
		}).
		when("/weather/:woeid" , {
			templateUrl : 'city-weather.htm',
		}).
		when("/search/:keyword", {
			templateUrl : 'search-city.htm',
		});
	});

	app.controller("citiesWeather", function($scope, $http){
	citiesWeather = [];
	weather = [];

		for(city in cities){
		    $http.get("weather.php?command=search&keyword="+cities[city])
		    .then(function(response) {
		    	console.log(response.data);
		    	var responseData = response.data[0];

		        weather.push(responseData['woeid']);
		        	if(weather.length == cities.length){
		      			for(woeid in weather){
		      				$http.get("weather.php?command=location&woeid="+ weather[woeid])
		      				.then(function(responses){
		      					var title = responses.data['title'];
		      					var woeid = responses.data['woeid'];

		      					var weatherDetails = responses.data['consolidated_weather'][0];
		      					citiesWeather.push({
		      						title: title, 
		      						woeid: woeid,
		      						applicable_date: weatherDetails['applicable_date'],
		      						the_temp: weatherDetails['the_temp'],
		      						max_temp: weatherDetails['max_temp'],
		      						min_temp: weatherDetails['min_temp'],
		      						weather_state_abbr: weatherDetails['weather_state_abbr'],
		      						weather_state_name: weatherDetails['weather_state_name']
		      						});
		      						if(citiesWeather.length == cities.length){
		      							$scope.weathers = citiesWeather;
		      							
		      						}
		      				});		      				
		      			}		
		        	}
		    });
		   }
	});

	app.controller("dailyWeather", ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http){
		$scope.woeid = $routeParams.woeid;
		$http.get("weather.php?command=location&woeid="+ $scope.woeid).then(function(response){
			var weathers = response.data['consolidated_weather'];
				$scope.weathers = weathers;
				$scope.cityName = "( "+response.data['title']+" )";
				 console.log($scope);

		});

	}]);

	app.controller('searchForm', ['$scope', '$http', '$location', function($scope, $http, $location){
		$scope.searchPlace = function(){
			$location.path("/search/"+$scope.searchField);
		}
	}]);

	app.controller('searchCitites', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http){	
		citiesWeather = [];
		citiesWoeid = [];
		$scope.keyword = $routeParams.keyword;
		$http.get("weather.php?command=search&keyword="+$scope.keyword).then(function(response){
			var weathers = response.data;
			for(woeid in weathers){
				citiesWoeid.push(weathers[woeid]['woeid']);
			}
			if(citiesWoeid.length != 0){
			for(woeid in citiesWoeid){
				$http.get("weather.php?command=location&woeid="+citiesWoeid[woeid]).then(function(responses){
					var title = responses.data['title'];
		      					var woeid = responses.data['woeid'];

		      					var weatherDetails = responses.data['consolidated_weather'][0];
		      					citiesWeather.push({
		      						title: title, 
		      						woeid: woeid,
		      						applicable_date: weatherDetails['applicable_date'],
		      						the_temp: weatherDetails['the_temp'],
		      						max_temp: weatherDetails['max_temp'],
		      						min_temp: weatherDetails['min_temp'],
		      						weather_state_abbr: weatherDetails['weather_state_abbr'],
		      						weather_state_name: weatherDetails['weather_state_name']
		      						});
		      						if(citiesWeather.length == cities.length){
		      							$scope.weathers = citiesWeather;
		      							
		      						}
				});	
			}}else{
				$scope.noResult = "No results were found. Try changing the keyword!";	
			}

			$scope.searchFor = "for ( "+$scope.keyword+" )";
		});
	}]);



	app.directive("weather", function(){
		return {
			templateUrl : "weather-component.htm",
			link: function(scope, element, attrs){
			var today = new Date();
				if(days[today.getDay()] == days[(new Date(scope.weather['applicable_date'])).getDay()]){
					scope.applicableDate = "Today";
				}else{
				  scope.applicableDate = days[(new Date(scope.weather['applicable_date'])).getDay()] +" "+((new Date(scope.weather['applicable_date'])).getDate()) ;
				}
				  scope.weatherName = scope.weather['weather_state_name'];
				  scope.theTemp = Math.round(scope.weather['the_temp']);
				  scope.minTemp = Math.round(scope.weather['min_temp']);
				  scope.maxTemp = Math.round(scope.weather['max_temp']);
				  scope.weatherIcon = "https://www.metaweather.com/static/img/weather/ico/"+scope.weather['weather_state_abbr']+".ico";
				 
			}
		}
	});	


