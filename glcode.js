Qt.include("three.js")
Qt.include("xpanol.js")
Qt.include('tween.js')
var camera, scene, renderer,orbital;
var cube;
var panorama;
var ray;
var mouse;
var cc;
var star;
var infospots=[]
var arrows=[];
function initializeGL(canvas,texture) {

    ray=new THREE.Raycaster()
    mouse=new THREE.Vector2()

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 1, 10000);
    renderer = new THREE.Canvas3DRenderer(
              { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });
    renderer.setSize( canvas.width, canvas.height );
    cc= new THREE.OrbitControls(camera,canvas);
    var info=new XPANOL.Infospot(500,50,100);
    scene.add(info.getInfospot())
    infospots.push(info);

    var front= new XPANOL.Arrow(XPANOL.Arrows.front);
    var back=new XPANOL.Arrow(XPANOL.Arrows.back);
    var left=new XPANOL.Arrow(XPANOL.Arrows.left);
    var right=new XPANOL.Arrow(XPANOL.Arrows.right);

    scene.add(front.getArrow());
    scene.add(back.getArrow());
    scene.add(left.getArrow())
    scene.add(right.getArrow())

    arrows.push(front);
    arrows.push(back);
    arrows.push(left);
    arrows.push(right)

    camera.position.z=1
    XPANOL.canvas=canvas;
    XPANOL.scene=scene;
    XPANOL.camera=camera;

    info.setElemt("nat nael mesfine");

    canvas.addEventListener("mousemove",onmousemove,false);
    canvas.addEventListener('mousedown',onmouseclicked,false)

}
function setImagePanoram(imageurl){
    if(star)
        scene.remove(star);

    var component = Qt.createComponent("ImagePanorama.qml");
    var elemnt = component.createObject(canvas3d, {"x":0,"y":0,"visible":false});

    star=new XPANOL.ImagePanorama(elemnt,5000);
    scene.add(star.getpanorama());
}
function setVideoPanoram(videourl){
    if(star)
        scene.remove(star);

    var component = Qt.createComponent("VideoPanoama.qml");
    var elemnt = component.createObject(canvas3d, {"x":0,"y":0,"visible":true});

    function creat(){
        star=new XPANOL.VideoPanorama(elemnt,5000);
        scene.add(star);
        console.log("finised")
    }
    elemnt.finshed.connect(creat);
}
function resizeGL(canvas) {
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(canvas.devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);
}
function paintGL(canvas) {

    var vector = camera.getWorldDirection();
    var theta = Math.atan2( vector.x, vector.z );
    var phi = Math.atan2( Math.sqrt( vector.x * vector.x + vector.z * vector.z ), vector.y );
    arrows.forEach(function(arrow){

        arrow.onPhitheta(phi,theta);
    });
    TWEEN.update()
    cc.update()
    renderer.render(scene, camera);
}
function onmousemove(event){

    mouse.x=(event.clientX /width )*2-1
    mouse.y=-( event.clientY /height ) * 2 + 1
    ray.setFromCamera(mouse,camera)

    var intersects = ray.intersectObjects(scene.children)
    if (intersects.length > 0) {

        infospots.forEach(function(infospot){
            if(infospot.getInfospot()===intersects[0].object){
                 infospot.onHover();
            }
            else
                infospot.onHoverEnd();

        });
        arrows.forEach(function(arrow){
            if(arrow.getArrow() === intersects[0].object){
                        arrow.onHover()
                    }else
                        arrow.onHoverEnd()
        });
        /* Check if the Hover Element is infospots
         *
         */


    }
}
function onmouseclicked(event){
    mouse.x=(event.clientX /width )*2-1
    mouse.y=-( event.clientY /height ) * 2 + 1
    ray.setFromCamera(mouse,camera)

    var intersects = ray.intersectObjects(scene.children)
    if (intersects.length > 0){
        if(intersects[0].object.datatype ==="arrow"){
            if(intersects[0].object.type===XPANOL.Arrows.front)
                star.onmovefront()
            else if(intersects[0].object.type=== XPANOL.Arrows.left)
                 star.onmoveleft()
            else if(intersects[0].object.type=== XPANOL.Arrows.right)
                 star.onmoveright()
        }
    }
}
