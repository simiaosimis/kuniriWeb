var mouseOverCanvas = true;

function canvasMouseClickListener(event) {
  for(var i=apo.entitylist.length-1; i >= 0; --i) {
    apo.entitylist[i].mouseclick(event);
  }
};

function canvasMouseMoveListener(event) {
  for(var i=apo.entitylist.length-1; i >= 0; --i) {
    apo.entitylist[i].mousemove(event);
  }
};

function canvasMouseLeaveListener(event) {
  mouseOverCanvas = false;
  startAnimation();
};

function canvasMouseOverListener(event) {
  mouseOverCanvas = true;
  startAnimation();
};

var apo = {
  canvas: document.getElementById('samplecanvas'),
  ctx: null,
  currentDiagram: "",
  entitylist: [],
  grid: null,
  currentScale: 1,
  getMousePos: function(event) {
    var rect = apo.canvas.getBoundingClientRect();
    return {x: event.clientX - rect.left, y: event.clientY - rect.top }
  },
  reloadCanvas: function(canvasID) {
    this.canvas = document.getElementById(canvasID);
    if (!this.canvas.getContext) {
      console.log("Canvas not supported");
      return false;
    }
    this.grid = new Grid();
    this.ctx = this.canvas.getContext('2d');
    this.ctx.save();
    this.canvas.addEventListener('click', canvasMouseClickListener);
    this.canvas.addEventListener('mousemove', canvasMouseMoveListener);
    this.canvas.addEventListener('mouseleave', canvasMouseLeaveListener, false);
    this.canvas.addEventListener('mouseover', canvasMouseOverListener, false);
    return true;
  },
  draw: function() {
    if(mouseOverCanvas){
      apo.ctx.clearRect(0, 0, apo.canvas.width, apo.canvas.height);
      if(apo.grid.active){
        console.log("desenhou");
        apo.grid.draw();
      }
      for(var i=0; i < apo.entitylist.length; i++){
        if(apo.entitylist[i].visible){
          apo.entitylist[i].draw();
        }
      }
    }

    window.requestAnimationFrame(apo.draw);
  }
};

function startAnimation() {
  if(mouseOverCanvas) {
    window.requestAnimationFrame(apo.draw);
  }
}

function zoomIn(){
  apo.ctx.restore();
  apo.ctx.save();
  apo.currentScale += 0.1;
  apo.ctx.scale(apo.currentScale, apo.currentScale);
  apo.grid.width *= (apo.currentScale);
  apo.grid.height *= (apo.currentScale);
};

function zoomOut(){
  apo.ctx.restore();
  apo.ctx.save();
  apo.currentScale -= 0.1;
  apo.ctx.scale(apo.currentScale, apo.currentScale);
  apo.grid.width *= (1/apo.currentScale);
  apo.grid.height *= (1/apo.currentScale);
};

function resetZoom(){
  apo.ctx.restore();
  apo.ctx.save();
  apo.currentScale = 1;
  apo.ctx.scale(apo.currentScale, apo.currentScale);
};

function saveImage(){
  window.open().location = apo.canvas.toDataURL("image/png");
};function Point(x=0, y=0) {
  this.x = x;
  this.y = y;
};

function Drawable() {
  this.name = 'draw';
  this.visible = true;
};

Drawable.prototype.draw = function() {
  console.log('draw function not implemented');
};

Drawable.prototype.mousemove = function(event){
};

Drawable.prototype.mouseclick = function(event){
};

/// ---- Line class ---- ///
Line.prototype = new Drawable();
Line.prototype.constructor=Line;

function Line() {
  //Drawable.call(this);
  this.points = [new Point(), new Point(), new Point()];
  this.A = null;
  this.B = null;
  apo.entitylist.push(this);
  this.textA = '';
  this.textB = '';
};

Line.prototype.recalculateLine = function(A, B) {

  if(typeof A == 'object'){
    this.A = A;
  }
  if(typeof B == 'object'){
    this.B = B;
  }

  if (this.colliding(this.A,this.B)) {
    this.visible = false;
  }
  else{
    this.visible = true;
  }

  var cax = this.A.x+this.A.width/2.0;
  var cay = this.A.y+this.A.height/2.0;
  var cbx = this.B.x+this.B.width/2.0;
  var cby = this.B.y+this.B.height/2.0;

  this.points[0].x = cax; this.points[0].y = cay;
  this.points[1].x = cbx; this.points[1].y = cay;
  this.points[2].x = cbx; this.points[2].y = cby;

  var yoffset = 8;
  // Set lines to the boundary of the diagram
  if(this.points[1].x > this.A.x + this.A.width) {
    this.points[0].x += this.A.width/2.0;
  }else if(this.points[1].x < this.A.x){
    this.points[0].x -= this.A.width/2.0;
  }
  else{
    if(cay > cby){
      this.points[0].y -= this.A.height/2.0;
      this.points[1].y = this.points[0].y + 1; //inheritance to right side
    }
    else{
      this.points[0].y += this.A.height/2.0;
      this.points[1].y = this.points[0].y;

    }
    this.points[0].x = this.points[1].x;
  }
  if(this.points[2].y > this.A.y + this.A.height + yoffset) {
    this.points[2].y -= this.B.height/2.0;
  }else if(this.points[2].y < this.A.y - yoffset){
    this.points[2].y += this.B.height/2.0;
  }
  else{
    if(cax > cbx){
      this.points[2].x += this.B.width/2.0;

    }
    else{
      this.points[2].x -= this.B.width/2.0;
    }
    this.points[2].y = this.points[0].y;
    this.points[1].x = this.points[2].x;
    this.points[1].y = this.points[2].y;
  }
};

Line.prototype.calculateLine = function(A, B) {
  this.recalculateLine(A, B);
  A.lines.push(this);
  B.lines.push(this);
};

Line.prototype.draw = function() {
  if(this.points.length == 0) return;

  apo.ctx.beginPath();
  apo.ctx.lineWidth = 2;
  apo.ctx.strokeStyle = "Black";
  apo.ctx.moveTo(this.points[0].x, this.points[0].y);

  for(var i=1; i < this.points.length; i++) {
    apo.ctx.lineTo(this.points[i].x, this.points[i].y);
  }
  apo.ctx.stroke();

  apo.ctx.font = "12px Times New Roman";
  apo.ctx.fillStyle = "Black";
  if(this.textA) {
    var dx = 0;
    if(this.points[0].x > this.points[1].x){
      dx = apo.ctx.measureText(this.textA).width+10;
    }
    var dy = 0;
    if(this.points[2].y > this.points[0].y){
      //dy = apo.ctx.measureText(this.textA).height+10;
    }
    apo.ctx.fillText(this.textA, this.points[0].x+5-dx, this.points[0].y-12+dy);
  }
  if(this.textB) {
    var dy = 0;
    if(this.points[2].y < this.points[1].y){
      dy = 30;
    }
    var lastI = this.points.length-1;
    apo.ctx.fillText(this.textB, this.points[lastI].x+5, dy+this.points[lastI].y-12);
  }
};

Line.prototype.colliding = function(A,B) {
  if((A.x + A.width) >= B.x && A.x <= (B.x + B.width)) {
    if((A.y + A.height) >= B.y && A.y <= (B.y + B.height)) {
      return true;
    }
  }
  return false;
};

InheritanceLine.prototype = new Line();
InheritanceLine.prototype.constructor=InheritanceLine;

function InheritanceLine() {
  Line.call(this);
};

InheritanceLine.prototype.draw = function() {
  if(!this.A || !this.B) return;
  Line.prototype.draw.call(this);
  var path = new Path2D();

  var px = this.points[0].x;
  var py = this.points[0].y;
  var size = 10;

  var horizontalArrow = true
  if(px == this.points[1].x){
    horizontalArrow = false;
  }

  if(horizontalArrow) {
    if(px > this.points[1].x) {
      size = -size;
    }
    path.moveTo(px, py);
    path.lineTo(px+size, py-size);
    path.lineTo(px+size, py+size);
  } else {
    if(py < this.points[1].y){
      size = -size;
    }
    path.moveTo(px, py);
    path.lineTo(px+size, py+size);
    path.lineTo(px-size, py+size);
  }
  apo.ctx.fill(path);
};/// ---- Diagram class ---- ///
DiagramObject.prototype = new Drawable();
DiagramObject.prototype.constructor=DiagramObject;

function DiagramObject(name) {
  Drawable.call(this);

  if(typeof name != 'undefined') {
    this.name = name;
  }
  else {
    this.name="DiagramObject";
  }

  this.x = 0;
  this.y = 0;
  this.height = 30+20;
  this.width = apo.ctx.measureText(this.name).width+10;
  apo.ctx.font = "20px Times New Roman";
  this.properties = [];
  this.lines = [];
  this.drag = false;
  this.updated = true;

  this.offset = {x:0, y:0}

  apo.entitylist.push(this);
  console.log("Diagram created");
};

DiagramObject.prototype.mousemove = function(event) {
  if(this.drag) {
    var rect = apo.canvas.getBoundingClientRect();
    this.x = event.clientX/apo.currentScale - (rect.left/apo.currentScale) - (this.offset.x*apo.currentScale);
    this.y = event.clientY/apo.currentScale - (rect.top/apo.currentScale) - (this.offset.y*apo.currentScale);
    this.reloadLines();
    this.updated = true;
  }
  else{
    this.updated = false;
  }
};

DiagramObject.prototype.mouseclick = function(event) {
  var mouse = apo.getMousePos(event);
  mouse.x /= apo.currentScale;
  mouse.y /= apo.currentScale;
  if(apo.currentDiagram != "" && apo.currentDiagram != this.name)
    return;
  if( mouse.x > this.x &&
      mouse.y > this.y &&
      mouse.x-this.width < this.x &&
      mouse.y-this.height < this.y) {
    this.drag = !this.drag;
    this.offset.x = mouse.x - this.x;
    this.offset.y = mouse.y - this.y;
    if(this.drag) {
      apo.currentDiagram = this.name;
    }
    else {
      apo.currentDiagram = "";
      if(apo.grid.active){
        var gridSize = apo.grid.step;
        this.x -= this.x % gridSize;
        this.y -= this.y % gridSize;
      }
      this.reloadLines();
    }
  }
};

DiagramObject.prototype.setPos = function(x, y) {
  this.x = x;
  this.y = y;
};

DiagramObject.prototype.draw = function() {
  var grd=apo.ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height/2);
  grd.addColorStop(0,"rgb(255,255,255)");
  grd.addColorStop(1,"rgb(255,255,255)");

  apo.ctx.fillStyle = grd;
  apo.ctx.fillRect(this.x, this.y, this.width, this.height);
  apo.ctx.lineWidth = 2;
  apo.ctx.strokeStyle = "Black";
  apo.ctx.strokeRect(this.x, this.y, this.width, this.height);

  apo.ctx.font = "20px Times New Roman";
  apo.ctx.fillStyle = "Black";
  apo.ctx.shadowOffsetX = 1;
  apo.ctx.shadowOffsetY = 1;
  apo.ctx.shadowBlur = 2;
  apo.ctx.shadowColor = "rgba(0,0,0,0.5)";
  apo.ctx.fillText(this.name, this.x+5, this.y+20);

  //Spacing after name, 5+height(20)+5
  apo.ctx.lineWidth = 1;
  apo.ctx.beginPath();
  apo.ctx.moveTo(this.x, this.y+30);
  apo.ctx.lineTo(this.x+this.width, this.y+30);
  apo.ctx.stroke();

  //Objects
  apo.ctx.font = "15px Times New Roman";
  apo.ctx.shadowBlur = 0;
  apo.ctx.shadowOffsetX = 0;
  apo.ctx.shadowOffsetY = 0;
  apo.ctx.shadowColor = "rgba(0,0,0,1)";
  for(var i=0; i < this.properties.length; i++) {
    this.properties[i].draw(this.x+5, this.y+35+15+20*i);
  }

};

DiagramObject.prototype.reloadLines = function() {
  for(var i=0; i < this.lines.length; i++) {
      this.lines[i].recalculateLine();
  }
}

DiagramObject.prototype.addProperty = function(obj) {
  this.height += 20;
  var objWidth = obj.getWidth();
  if(objWidth > this.width) {
    this.width = objWidth;
    this.reloadLines();
  }
  this.properties.push(obj);
};

/// ---- Properties end ---- ///
var visibility = {
  public: 0,
  private: 1,
  protected: 2
};function Property(name="Property", type=null) {
  this.name = name;
  this.visibility = visibility.public;
  this.type = type;
};

Property.prototype.getWidth = function() {
  return 15;
}

Property.prototype.draw = function(x, y) {
  switch(this.visibility) {
    case visibility.public:
      apo.ctx.fillText("+", x, y);
      break;
    case visibility.private:
      apo.ctx.fillText("-", x, y);
      break;
    case visibility.protected:
      apo.ctx.fillText("#", x, y);
      break;
  }
};Variable.prototype = new Property();
Variable.prototype.constructor=Variable;

function Variable(name, type) {
  Property.call(this);
  if(typeof name != 'undefined')
    this.name = name;
  if(typeof type != 'undefined')
    this.type = type;
};

Variable.prototype.getWidth = function() {
  apo.ctx.font = "15px Times New Roman";
  var len = Property.prototype.getWidth.call(this);
  len += apo.ctx.measureText(this.type+"  : "+this.name).width;
  return len;
}

Variable.prototype.draw = function(x, y) {
  Property.prototype.draw.call(this, x, y);

  var len = apo.ctx.measureText(this.type+" : ");
  apo.ctx.fillText(this.type+" : ", x+10, y);
  apo.ctx.fillText(this.name, x+10+len.width, y);
};Method.prototype = new Property();
Method.prototype.constructor=Method;

function Method(name, type) {
  Property.call(this);
  if(typeof name != 'undefined')
    this.name = name;
  if(typeof type != 'undefined')
    this.type = type;

  this.parameters = []
};

// Should use the following example format
// int methodCall(int : variableName, int : variable2)
Method.prototype.getWidth = function() {
  apo.ctx.font = "15px Times New Roman";
  var len = Property.prototype.getWidth.call(this);
  len += apo.ctx.measureText(this.type+" : "+this.name+"(").width;

  for(var i=0; i < this.parameters.length; i++) {
    len += apo.ctx.measureText(this.parameters[i].type +" : "+this.parameters[i].name).width;
    if(i != this.parameters.length-1){
      len += apo.ctx.measureText(", ").width;
    }
  }
  len += apo.ctx.measureText(") ").width;
  return len;
}

Method.prototype.draw = function(x, y) {
  Property.prototype.draw.call(this, x, y);

  var len = apo.ctx.measureText(this.type+" : ");
  apo.ctx.fillText(this.type+" : ", x+10, y);
  var text = this.name + "(";
  for(var i=0; i < this.parameters.length; i++) {
    text += this.parameters[i].type + " : " + this.parameters[i].name;
    if(i != this.parameters.length-1) {
      text += ", ";
    }
  }
  text += ")";
  apo.ctx.fillText(text, x+10+len.width, y);
};// Require apoena.js to be imported before this

var apo_parser = {
  dx: 0,
  dy: 0,
  inheritanceData: [],
  diagramData: [],
  processClass: function(data) {
    diagram = new DiagramObject(data.getAttribute('name'));
    diagram.x = this.dx;
    diagram.y = this.dy;
    this.dx += 200;
    if(this.dx > 2500) {
      this.dx = 0;
      this.dy += 200;
    }
    for(var i=0; i < data.children.length; i++) {
      console.log(data.children[i]);
      var name = data.children[i].tagName;
      if(name == "method") {
          this.processMethod(data.children[i], diagram);
      } else
      if(name == "variable") {
          this.processVariable(data.children[i], diagram);
      }
      if(name == "inheritance") {
          this.inheritanceData.push([data.children[i].getAttribute('name'), diagram.name])
      }
    }
    this.diagramData.push(diagram);
  },
  processMethod: function(data, diagram) {
    method = new Method(data.getAttribute('name'));

    for(var i=0; i < data.children.length; i++) {
      console.log(data.children[i]);
      var name = data.children[i].tagName;
      if(name == "parameter") {
          this.processParameter(data.children[i], method);
      }
    }
    diagram.addProperty(method);
  },
  processParameter: function(data, method) {
    prop = new Property(data.getAttribute('name'), "float");
    console.log(prop);
    method.parameters.push(prop);
    for(var i=0; i < data.children.length; i++) {
      console.log(data.children[i]);
      var name = data.children[i].tagName;
    }
  },
  processVariable: function(data, diagram) {
  },
  xml: null
};

function get_diagram_by_name(dname) {
  for(var i=0; i < apo_parser.diagramData.length; i++) {
    if(apo_parser.diagramData[i].name == dname){
      return apo_parser.diagramData[i]
    }
  }
  return null;
}

function import_class(xml_path) {
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", xml_path, false);
  xmlhttp.send();

  apo_parser.xml = xmlhttp.responseXML;
  // Remove the kuniri node
  apo_parser.xml = apo_parser.xml.children[0]

  for(var i=0; i < apo_parser.xml.children.length; i++) {
    console.log(apo_parser.xml.children[i]);
    var name = apo_parser.xml.children[i].tagName;
    if(name == "class_data") {
      apo_parser.processClass(apo_parser.xml.children[i]);
    }
  }

  for(var i=0; i < apo_parser.inheritanceData.length; i++) {
    l = new InheritanceLine();
    d1 = get_diagram_by_name(apo_parser.inheritanceData[i][0])
    d2 = get_diagram_by_name(apo_parser.inheritanceData[i][1])
    if(!d1 || !d2) {
      continue;
    }
    l.calculateLine(d1, d2);
  }
};Grid.prototype = new Drawable();
Grid.prototype.constructor=Grid;

function Grid() {
  Drawable.call(this);
  this.width = apo.canvas.width;
  this.height = apo.canvas.height;

  this.active = true;
  this.step = 20;

  this.draw = function(){
    apo.ctx.clearRect(0, 0, this.width, this.height);
    apo.ctx.lineWidth = 0.5;
    apo.ctx.strokeStyle = "blue";
    for (var i = 0; i < this.height; i+=this.step) {
      apo.ctx.beginPath();
      apo.ctx.moveTo(0,i);
      apo.ctx.lineTo(this.width,i);
      apo.ctx.stroke();
    }
    for (var i = 0; i < this.width; i+=this.step) {
      apo.ctx.beginPath();
      apo.ctx.moveTo(i,0);
      apo.ctx.lineTo(i,this.height);
      apo.ctx.stroke();
    }
  }

  this.changeState = function(){
    this.active = !this.active;
    mouseOverCanvas = true;
  }
}
