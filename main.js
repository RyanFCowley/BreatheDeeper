//===============================================================================
//map create
var mymap = L.map('mapid', {zoomControl: false}).setView([40, -110], 4);
//when window loads, run JSON function
window.onload = loadJSON;
//setting to focus on USA and desired zoom
mymap.bounds = [],
mymap.setMaxBounds([
  //S,W,N,E
  [20, -150],
  [55, -60]
])
mymap.maxZoom = [],
mymap.minZoom = [],
mymap.setMaxZoom([7])//zoom in
mymap.setMinZoom([4])//zoom out

//creating map tiles
var CartoDB_DarkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
});
//display our glorious map
CartoDB_DarkMatter.addTo(mymap);


//===============================================================================
//border outlines
function style(feature) {
    return {
        fillColor: 'white',
        weight: 2,
        opacity: 1,
        color: '#666',
        dashArray: '3',
        fillOpacity: 0.01
    };
}
//highlight on mouseover
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#ffffff',
        dashArray: '',
        fillOpacity: 0.1
    });

/*
  --commented out so as to allow circles to be above the map layers--

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        //layer.bringToFront();
    }
    */
    info.update(layer.feature.properties);
    
}

//when you mouse off a tile, un-highlight it
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();

}

var geojson;

//click to zoom
function zoomToFeature(e) {
    mymap.fitBounds(e.target.getBounds());
}

//mousing over and clicking on state tiles
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

//load the state boundaries onto map tile
geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(mymap);


/*Code to make poulation density appear when mousing over states*/
var info = L.control();
info.onAdd = function(mymap){
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

//format the pop density counter
info.update = function(props){
  this._div.innerHTML = '<h4>US Population Density</h4>'+ (props ?
  '<b>' + props.name + '</b><br />' +props.density + ' people / mi<sup>2</sup>'
  : 'Hover over a state');
};
/*add population data to map*/
info.addTo(mymap);



var legend = L.control({position: 'bottomright'});
legend.onAdd = function(mymap){
  var div = L.DomUtil.create('div', 'info legend'),
  grades = [0, 10, 20, 50, 100, 200, 500, 1000],
  labels = [];

/*All this does is break things so keep it locked up in this comment. 25 to life. solitary confinment
for(var i = 0; i < grades.length; i++){
  div.innerHTML +=
    '<i style="background:' + getColour(grades[i] + 1) + '"></i> '+
    grades[i] +(grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}*/

  return div;
};

legend.addTo(mymap);


//===============================================================================



/*function to load everything when site is opened*/
function loadJSON(air){


/*Get the JSON from the API*/
  $.getJSON("https://api.waqi.info/map/bounds/?latlng=28.70,-127.50,48.85,-55.90&token=ad9b0d10be0a4d6028e3724fc9d4f7e24a429d85", function(result){
  /*ForEach loop to find every dot*/
  result.data.forEach(function(thing){


			/*Create longitude and latitude variables*/
      var lng = thing.lon;
      var lat = thing.lat;

	    var ql = thing.aqi;

  /*fuction for assigning air quality to levels*/
	function getLevel(ql){
		return ql > 300 ? 7:
		 	ql > 200 ? 6:
			ql > 150 ? 5:
			ql > 100 ? 4:
			ql > 50  ? 3:
			ql > 25  ? 2:
			ql >= 0  ? 1:
        0;
	}


  //set colour based on level
	function getColour(lvl){
		return lvl == 7  ?  '#7e0023':
			lvl == 6  ?  '#660099':
			lvl == 5  ?  '#cc0033':
			lvl == 4  ?  '#ff9933':
			lvl == 3  ?  '#ffde33':
			lvl == 2  ?  '#99cc44':
		      	     	     '#009966';
	}


  //set radius of circle
	function getRadius(lvl){
		return 5000 + ((lvl - 1)*1500);
	}



  //set level to aqi data
	var level = getLevel(ql);

  if (getLevel(ql) < 0){
    ql.level = 0;
  }

console.log(ql);
      /*Draw circles*/
      var circle = L.circle([lat,lng],{


	/*assign colour based on level*/
        color: getColour(level),
	/*Fill them with the assigned colour*/
        fillColor: getColour(level),
	/*make 'em see through*/
        fillOpacity: 0.5,

	/*if the level is high, increase radius*/
        radius: getRadius(level),

        riseOnHover: true,

      level:ql
      });





	     /*Draw Circle on map*/
      circle.addTo(mymap).on("click", circleClick);
      circle.bringToFront();

});
});
}
//when clicking a circle
function circleClick(e) {

    var clickedCircle = e.target;

    //logs for testing
    console.log(e.target);

    console.log(clickedCircle.options.level);


     //display the air quality in a pop up box
     clickedCircle.bindPopup("Pollution level: " + clickedCircle.options.level + "ppm/m" + '<sup>3</sup>').openPopup();





}
