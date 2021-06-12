$( document ).ready(function() {
var $window = $(window);
// Make an instance of two and place it on the page.
var elem = document.getElementById('myCanvasGJK');
var params = { width: 500, height: 200, autostart: true };
var two = new Two(params).appendTo(elem);
var background = two.makeGroup();
var foreground = two.makeGroup();

var grid = new GRID.Grid(two, 50, two.width / 2, two.height / 2);

var polygon = new POLYGON.PolygonObject(two, POLYGON.createCircle(50, 3));
polygon.anchors[0].translation.set(two.width / 2, two.height / 2);
var polygon2 = new POLYGON.PolygonObject(two, POLYGON.createCircle(50, 4));
polygon2.anchors[0].translation.set(two.width / 2, two.height / 2);

var gjk = new GJK.Gjk(two, polygon, polygon2);

gjk.step(two, polygon, polygon2);

foreground.add(gjk.group);
foreground.add(gjk.simplexGroup);
console.log(gjk.simplexGroup);

background.add(polygon.mainGroup);
background.add(polygon2.mainGroup);

polygon.anchors[0].translation.set(1000, 1000);
polygon2.anchors[0].translation.set(1000, 1000);

two.update();

two.bind('update', function(frameCount) {
  if(frameCount % 100 == 0) {
    gjk.step(two, polygon, polygon2);
    foreground.add(gjk.simplexGroup);
  }
}).play();

});
