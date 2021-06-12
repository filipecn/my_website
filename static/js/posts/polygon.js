var GJK = {};

GJK.Gjk = function (two, p1, p2) {
  this.hull = [];
  this.group = null;
  this.path = null;
  this.makeSet(two, p1, p2);
  this.simplex = [];
  this.D = new Two.Anchor(0, 1);
  this.simplexGroup = null;
};

function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function cross(a, b) {
    return a.x * b.y - a.y * b.x;
}

function ccw(p1, p2, p3) {
  return (p2.x - p1.x)*(p3.y - p1.y) - (p2.y - p1.y)*(p3.x - p1.x);
}

function right(a) {
  return new Two.Anchor(a.y,-a.x);
}

function left(a) {
  return new Two.Anchor(-a.y, a.x);
}

Array.prototype.swap = function (x,y) {
  var b = this[x];
  this[x] = this[y];
  this[y] = b;
  return this;
}

function support(p, d) {
  var M = dot(p.points[0].translation, d);
  var Mi = 0;
  for(var i = 1; i < p.points.length; i++) {
    var dd = dot(p.points[i].translation, d);
    if(dd > M) {
      Mi = i;
      M = dd;
    }
  }
  return p.points[Mi].translation;
}

GJK.Gjk.prototype.step = function(two, p1, p2) {
  var colors = ['rgba(200, 128, 125, 0.7)', 'rgba(100, 228, 125, 0.7)', 'rgba(100, 128, 225, 0.7)'];

  var offset1 = p1.points[0].parent.translation;
  var offset2 = p2.points[0].parent.translation;
  var O = new Two.Anchor(offset1.x - offset2.x, offset1.y - offset2.y);
  if(this.simplex.length == 0)
    this.D = new Two.Anchor(0, 1);
  var s1 = support(p1, this.D);
  var s2 = support(p2, new Two.Anchor(-this.D.x, -this.D.y));
  this.simplex.push(new Two.Anchor(s1.x - s2.x, s1.y - s2.y));
  this.simplex[this.simplex.length - 1].id = this.simplex.length - 1;

  if(this.simplexGroup != null) {
    two.remove(this.simplexPath);
    this.simplexGroup.remove(this.simplexVertices);
    this.simplexPath.remove();
    two.remove(this.simplexGroup);
    for(var i = 0; i < this.simplexVertices.length; i++)
      two.remove(this.simplexVertices[i]);
    two.remove(this.simplexVertices);
    two.remove(this.simplexGroup);
  }

  this.simplexVertices = [];
  for(var i = 0; i < this.simplex.length; i++) {
    this.simplexVertices.push(two.makeCircle(this.simplex[i].x, this.simplex[i].y, 5));
    this.simplexVertices[i].fill = colors[this.simplex[i].id];
  }

  this.simplexGroup = two.makeGroup(this.simplexVertices);

  this.simplexPath = new Two.Path(this.simplex);
  this.simplexPath.fill = 'rgba(229, 128, 225, 0.3)';
  this.simplexPath.stroke = 'rgba(229, 128, 125, 0.3)';
  this.simplexGroup.add(this.simplexPath);

  if(this.simplex.length == 1) {
    this.D = new Two.Anchor(-this.simplex[0].x, -this.simplex[0].y);
  }
  else if(this.simplex.length == 2) {
    var a = new Two.Anchor(this.simplex[1].x - this.simplex[0].x, this.simplex[1].y - this.simplex[0].y);
    if(cross(a, new Two.Anchor(O.x - this.simplex[0].x, O.y - this.simplex[0].y)) < 0) {
      this.simplex.swap(0, 1);
      this.D = right(a);
    }
    else this.D = left(a);
  }
  else if(this.simplex.length == 3) {
    var a = new Two.Anchor(this.simplex[2].x - this.simplex[0].x, this.simplex[2].y - this.simplex[0].y);
    if(cross(a, new Two.Anchor(O.x - this.simplex[0].x, O.y - this.simplex[0].y)) > 0) {
      this.D = left(a);
      this.simplex.swap(1, 2);
      this.simplex.pop();
    }
    else {
      var b = new Two.Anchor(this.simplex[2].x - this.simplex[1].x, this.simplex[2].y - this.simplex[1].y);
      if(cross(b, new Two.Anchor(O.x - this.simplex[1].x, O.y - this.simplex[1].y)) < 0) {
        this.D = right(b);
        this.simplex.swap(0, 2);
        this.simplex.pop();
      }
      else {
        this.simplex = [];
      }
    }
  }
  else {
    this.simplex = [];
  }

  this.simplexGroup.translation.set(two.width / 2, two.height / 2);
  this.simplexGroup.scale = 1;
  this.simplexGroup.noStroke();
}

GJK.Gjk.prototype.makeSet = function(two, p1, p2) {
  var vertices = [];
  if(this.group  != null) {
    two.remove(this.path);
    two.remove(this.group);
  }
  var offset1 = p1.points[0].parent.translation;
  var offset2 = p2.points[0].parent.translation;
  // get all differences
  var lowestY = 0;
  for(var i = 0; i < p1.polygon.size; i++)
    for(var j = 0; j < p2.polygon.size; j++) {
      vertices.push(new Two.Anchor(
        p1.points[i].translation.x + offset1.x - p2.points[j].translation.x - offset2.x,
        p1.points[i].translation.y + offset1.y - p2.points[j].translation.y - offset2.y));
      if(vertices[i * p2.polygon.size + j].y < vertices[lowestY].y)
        lowestY = i * p2.polygon.size + j;
    }

  vertices = vertices.swap(0, lowestY);

  var P = vertices[0];
  var S = vertices.slice(1, vertices.length);
  S.sort(function(a, b) {
    var o = ccw(P, a, b);
    if(o > 0)
      return 1;
    if(o < 0)
      return -1;
    var DA = dot(a - P, a - P);
    var DB = dot(b - P, b - P);
    if(DA < DB)
      return -1;
    return 1;
  });
  //console.log("asdasdasd");
  var SS = [P];
  for(var i = 0; i < S.length; i++)
    SS.push(S[i]);
  //for(var i = 0; i < SS.length; i++)
  //    console.log(SS[i]);
  var stack = [SS[0], SS[1], SS[2]];
  for(var i = 3; i < SS.length; i++) {
    var top = stack[stack.length - 1];
    stack.pop();
    while(ccw(stack[stack.length - 1], top, SS[i]) >= 0) {
      top = stack[stack.length - 1];
      stack.pop();
    }
    stack.push(top);
    stack.push(SS[i]);
  }

  //var points = [];
  //for(var i = 0; i < stack.length; i++) {
  //  points.push(two.makeCircle(stack[i].x, stack[i].y, 3));
  //  points[i].fill = '#FF8000';
  //  console.log(stack[i]);
  //}

  this.path = new Two.Path(stack);
  this.path.fill = 'rgba(229, 128, 125, 0.3)';
  this.path.noStroke();

  this.group = two.makeGroup(this.path);
  this.group.translation.set(two.width / 2, two.height / 2);
  this.group.scale = 1;
  this.group.noStroke();
  //this.group.add(points);
}

var LEVELSET = {};

LEVELSET.LevelSet = function(two, size, ox, oy) {
  var w = two.width;
  var h = two.height;
  var k = 2;
  this.wsize = w / size;
  this.hsize = h / size;
  this.h = size;
  this.m = [];
  for(var r = 0; r < this.hsize; r++)
    this.m[r] = [];
  for(var r = 0; r < this.hsize; r++)
    for(var c = 0; c < this.wsize; c++)
      this.m[r][c] = 1000;
};

LEVELSET.LevelSet.prototype.computeDistances = function(points) {
  for(var r = 0; r < this.hsize; r++)
    for(var c = 0; c < this.wsize; c++)
      this.m[r][c] = 10000;
  // set initial distances
  var T = this;
  _.each(points, function(point) {
    var col = Math.round(point.translation.x / T.h);
    var row = Math.round(point.translation.y / T.h);
    col = Math.max(0, Math.min(col, T.wsize - 1));
    row = Math.max(0, Math.min(row, T.hsize - 1));
    T.m[row][col] = 0;
  });
    // fast sweeping
    var lim = [[0,              this.wsize, 0,              this.hsize],
               [this.wsize - 1,         -1, 0,              this.hsize],
               [this.wsize - 1,         -1, this.hsize - 1,         -1],
               [0,              this.wsize, this.hsize - 1,         -1]];

    for(var l = 0; l < 4; l++) {
      var idir = 1, jdir = 1;
      if(lim[l][0] > lim[l][1])
        idir = -idir;
      if(lim[l][2] > lim[l][3])
        jdir = -jdir;
      for(var i = lim[l][0]; i != lim[l][1]; i += idir)
        for(var j = lim[l][2]; j != lim[l][3]; j += jdir) {
          if(jdir > 0 && j > 0)
            this.m[j][i] = Math.min(this.m[j][i], this.m[j - 1][i] + this.h);
          if(jdir < 0 && j < this.hsize - 1)
            this.m[j][i] = Math.min(this.m[j][i], this.m[j + 1][i] + this.h);
          if(idir > 0 && i > 0)
            this.m[j][i] = Math.min(this.m[j][i], this.m[j][i - 1] + this.h);
          if(idir < 0 && i < this.wsize - 1)
            this.m[j][i] = Math.min(this.m[j][i], this.m[j][i + 1] + this.h);
        }
    }
  /*for(var i = 0; i < this.hsize; i++) {
      var str = "row\t";
      for(var j = 0; j < this.wsize; j++)
        str += this.m[i][j] + "\t";
      console.log(str);
    }*/
};

function interp(fa, fb, fc, a, b) {
  return (fc - fa) * (b - a) / (fb - fa) + a;
}

var MSQUARES = {};

MSQUARES.MSquares = function(two) {
  this.group = two.makeGroup();
  this.points = [];
};

MSQUARES.MSquares.prototype.update = function(two, levelSet, l, colors, strokes) {
  if(this.points.length > 0) {
    for(var i = 0; i < this.points.length; i++)
      this.group.remove(this.points[i]);
    for(var i = 0; i < this.lines.length; i++)
      this.group.remove(this.lines[i]);
  }
  two.remove(this.group);
  this.group.remove();
  this.points = [];
  this.lines = [];
  // main axis
  for(var i = 0; i < l.length; i++)
    for(var r = 0; r < levelSet.hsize - 1; r++)
      for(var c = 0; c < levelSet.wsize - 1; c++) {
        var vertices = [];
        if(levelSet.m[r][c] <= l[i] && levelSet.m[r + 1][c] > l[i] ||
           levelSet.m[r][c] >= l[i] && levelSet.m[r + 1][c] < l[i]) {
          vertices.push([c * levelSet.h, interp(levelSet.m[r][c], levelSet.m[r + 1][c], l[i], r * levelSet.h, (r + 1) * levelSet.h)]);
          //this.points.push(two.makeCircle(vertices[vertices.length - 1][0], vertices[vertices.length - 1][1], 5));
        }
        if(levelSet.m[r][c] <= l[i] && levelSet.m[r][c + 1] > l[i] ||
           levelSet.m[r][c] >= l[i] && levelSet.m[r][c + 1] < l[i]) {
          vertices.push([interp(levelSet.m[r][c], levelSet.m[r][c + 1], l[i], c * levelSet.h, (c + 1) * levelSet.h), r * levelSet.h]);
          //this.points.push(two.makeCircle(vertices[vertices.length - 1][0], vertices[vertices.length - 1][1], 5));
        }
        if(levelSet.m[r][c + 1] <= l[i] && levelSet.m[r + 1][c + 1] > l[i] ||
           levelSet.m[r][c + 1] >= l[i] && levelSet.m[r + 1][c + 1] < l[i]) {
          vertices.push([(c + 1) * levelSet.h, interp(levelSet.m[r][c + 1], levelSet.m[r + 1][c + 1], l[i], r * levelSet.h, (r + 1) * levelSet.h)]);
          //this.points.push(two.makeCircle(vertices[vertices.length - 1][0], vertices[vertices.length - 1][1], 5));
        }
        if(levelSet.m[r + 1][c] <= l[i] && levelSet.m[r + 1][c + 1] > l[i] ||
           levelSet.m[r + 1][c] >= l[i] && levelSet.m[r + 1][c + 1] < l[i]) {
          vertices.push([interp(levelSet.m[r + 1][c], levelSet.m[r + 1][c + 1], l[i], c * levelSet.h, (c + 1) * levelSet.h), (r + 1) * levelSet.h]);
          //this.points.push(two.makeCircle(vertices[vertices.length - 1][0], vertices[vertices.length - 1][1], 5));
        }
        if(vertices.length == 2) {
          this.lines.push(new Two.Line(vertices[0][0], vertices[0][1], vertices[1][0], vertices[1][1]));
          this.lines[this.lines.length - 1].linewidth = strokes[i];
          this.lines[this.lines.length - 1].stroke = colors[i];
        }
      }

  //_.each(points, function(point) {
  //  var col = Math.round(point.translation.x / levelSet.h);
  //  var row = Math.round(point.translation.y / levelSet.h);
  //  console.log(point.translation.x + " " + point.translation.y);
  //});

  this.group = two.makeGroup(this.points);
  this.group.add(this.lines);
}

var GRID = {};

GRID.Grid = function(two, size, ox, oy) {
  var w = two.width;
  var h = two.height;
  this.lines = [];
  // main axis
  this.lines.push(new Two.Line(ox, -h, ox, h));
  this.lines[0].linewidth = 1;
  this.lines[0].stroke = 'rgba(0, 0, 0, 0.2)';
  this.lines.push(new Two.Line(-w, oy, w, oy));
  this.lines[1].linewidth = 1;
  this.lines[1].stroke = 'rgba(0, 0, 0, 0.2)';
  var k = 2;
  for(var i = size; i <= w; i += size) {
    this.lines.push(new Two.Line(ox + i, -h, ox + i, h));
    this.lines[k].linewidth = 1;
    this.lines[k].stroke = 'rgba(0, 0, 0, 0.1)';
    k++;
    this.lines.push(new Two.Line(ox - i, -h, ox - i, h));
    this.lines[k].linewidth = 1;
    this.lines[k].stroke = 'rgba(0, 0, 0, 0.1)';
    k++;
  }
  for(var i = size; i <= h; i += size) {
    this.lines.push(new Two.Line(-w, oy + i, w, oy + i));
    this.lines[k].linewidth = 1;
    this.lines[k].stroke = 'rgba(0, 0, 0, 0.1)';
    k++;
    this.lines.push(new Two.Line(-w, oy - i, w, oy - i));
    this.lines[k].linewidth = 1;
    this.lines[k].stroke = 'rgba(0, 0, 0, 0.1)';
    k++;
  }

  this.group = two.makeGroup(this.lines);
}

var POLYGON = {};

POLYGON.Polygon = function(v) {
  this.size = v.length;
  this.vertices = v;
};

POLYGON.createCircle = function(r, n) {
  var angle = 2* Math.PI;
  var step = angle / n;
  var radius = r;
  var vertices = [];
  for(var i = 0; i < n; i++) {
    vertices.push(new Two.Vector(radius * Math.cos(angle), radius * Math.sin(angle) ));
    angle -= step;
  }
  return new POLYGON.Polygon(vertices);
};

POLYGON.PolygonObject = function(two, p) {
  this.polygon = p;

  this.pathPoints = [];
  for(var i = 0; i < this.polygon.size; i++) {
    this.pathPoints.push(new Two.Anchor().copy(this.polygon.vertices[i]));
    this.pathPoints[i].id = i;
  }
  this.path = new Two.Path(this.pathPoints);
  this.path.linewidth = 5;
  this.path.fill = 'rgba(79, 128, 255, 0.3)';
  this.path.stroke = '#FF8000';

  this.points = [];
  for(var i = 0; i < this.polygon.size; i++) {
    this.points.push(two.makeCircle(this.polygon.vertices[i].x, this.polygon.vertices[i].y, 5));
    this.points[i].fill = '#FF8000';
  }

  this.group = two.makeGroup(this.path);
  this.group.add(this.points);

  var T = this;
  _.each(this.pathPoints, function(anchor) {
    T.points[anchor.id].translation.copy(anchor);

    T.points[anchor.id].translation.bind(Two.Events.change, function() {
      anchor.copy(this);
      T.path.vertices[anchor.id].copy(this);
    });

  });

  this.anchors = [];
  this.anchors.push(two.makeCircle(0, 0, 10));
  this.anchors[0].fill = 'rgba(79, 128, 255, 0.8)';
  this.anchors[0].noStroke();
  this.anchorsGroup = two.makeGroup(this.anchors);

  _.each(this.anchors, function(anchor) {
    anchor.translation.bind(Two.Events.change, function() {
      T.translate(T.anchors[0].translation.x, T.anchors[0].translation.y);
    });
  });

  this.mainGroup = two.makeGroup(this.group);
  this.mainGroup.add(this.anchorGroup)
}

POLYGON.PolygonObject.prototype.translate = function(x, y) {
  this.group.translation.set(x, y);
  this.group.scale = 1;
  this.group.noStroke();
};

POLYGON.PolygonObject.prototype.center = function() {
  var sumX = 0.0, sumY = 0.0;
  _.each(this.points, function(point) {
    sumX += point.translation.x;
    sumY += point.translation.y;
  });
  return new Two.Vector(sumX / this.polygon.size, sumY / this.polygon.size);
};
