Qt.include("three.js")

var XPANOL = { REVISION: '0' };
(function (){
    /** Basic compnets of 3d
     *
     */
      XPANOL.canvas;
      XPANOL.scene;
      XPANOL.camera;

    /**
      * get the postion of the elemnt on screen
      */
    XPANOL.getScreenVector=function( worldVector ) {

        var vector = worldVector.clone();
        var widthHalf = ( XPANOL.canvas.width ) / 2;
        var heightHalf = XPANOL.canvas.height / 2;

        vector.project(  XPANOL.camera );

        vector.x = ( vector.x * widthHalf ) + widthHalf;
        vector.y = - ( vector.y * heightHalf ) + heightHalf;
        vector.z = 0;

        return vector;

    };
})();
(function(){
    /**
     * Data Image
     * @memberOf PANOLENS
     * @enum {string}
     */
    XPANOL.DataImage = {
        Info:"sdsd"
    }
    XPANOL.Arrows={
        front: 0,
        right:1,
        left:2,
        back:3
    }
})();
(function(){

    /**
     * Control Index Enum
     * @memberOf XPANOL
     * @enum {number}
     */

    XPANOL.Controls = {

        ORBIT: 0,

        DEVICEORIENTATION: 1

    };

    /**
     * Effect Mode Enum
     * @memberOf XPANOL
     * @enum {number}
     */
    XPANOL.Modes = {

        /** Unknown */
        UNKNOWN: 0,

        /** Normal */
        NORMAL: 1,

        /** Google Cardboard*/
        CARDBOARD: 2,

        /** Stereoscopic **/
        STEREO: 3

    };

})();;

(function(){

    XPANOL.Panorama = function ( ) {

    this.datatype = 'panorama';
    var duration = 300;
    var startScale = -30000
    this.movefront= new TWEEN.Tween( this.position )
        .to( { x: startScale+x}, duration )
        .easing( TWEEN.Easing.Elastic.Out );
    this.resetfront= new TWEEN.Tween( this.position )
        .to( { x: startScale-x}, duration )
        .easing( TWEEN.Easing.Elastic.Out );


}

XPANOL.Panorama.prototype = Object.create( THREE.Mesh.prototype );

XPANOL.Panorama.prototype.constructor = XPANOL.Panorama;

})();;
(function(){

    /**
     * Equirectangular based image panorama
     * @constructor
     * @param {string} image - Image url or HTMLImageElement
     * @param {number} [radius=5000] - Radius of panorama
     */
    XPANOL.ImagePanorama = function ( image, radius ) {
        var scope=this;
        radius = radius || 5000;
        var texture = new THREE.QtQuickItemTexture( image );
        texture.repeat = new THREE.Vector2( 1, 1 );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        var material	= new THREE.MeshBasicMaterial({
            map	: texture,
            color:"white",
            side	: THREE.BackSide
        })
        var geometry	= new THREE.SphereGeometry(radius, 32, 32)
        this.mesh	= new THREE.Mesh(geometry, material)

        var duration = 1000;
        var startScale = 3000
        var postion=this.mesh.position

        this.movefront= new TWEEN.Tween( this.mesh.position )
            .to( { z: startScale}, duration )
            .onComplete(function(){scope.resetfront.start()})
            .easing( TWEEN.Easing.Elastic.Out );
        this.resetfront= new TWEEN.Tween( this.mesh.position )
            .to( { z: postion.x}, duration/10 )
            .easing( TWEEN.Easing.Elastic.Out )

        this.moveleft= new TWEEN.Tween( this.mesh.position )
            .to( { x: -startScale}, duration )
            .onComplete(function(){scope.resetleft.start()})
            .easing( TWEEN.Easing.Elastic.Out );
        this.resetleft= new TWEEN.Tween( this.mesh.position )
            .to( { x: postion.x}, duration/10 )
            .easing( TWEEN.Easing.Elastic.Out )

        this.moveright= new TWEEN.Tween( this.mesh.position )
            .to( { x: startScale}, duration )
            .onComplete(function(){scope.resetright.start()})
            .easing( TWEEN.Easing.Elastic.Out );
        this.resetright= new TWEEN.Tween( this.mesh.position )
            .to( { x: postion.x}, duration/3 )
            .easing( TWEEN.Easing.Elastic.Out )

        this.moveback= new TWEEN.Tween( this.mesh.position )
            .to( { z: startScale}, duration )
            .onComplete(function(){scope.resetfront.start()})
            .easing( TWEEN.Easing.Elastic.Out );
        this.resetback= new TWEEN.Tween( this.mesh.position )
            .to( { z: postion.z}, duration/10 )
            .easing( TWEEN.Easing.Elastic.Out )


    };

    XPANOL.ImagePanorama.prototype.getpanorama=function(){
          return this.mesh
    };
    XPANOL.ImagePanorama.prototype.onmovefront=function(){
            this.movefront.start()

    };
    XPANOL.ImagePanorama.prototype.onmoveleft=function(){
            this.moveleft.start()

    };
    XPANOL.ImagePanorama.prototype.onmoveright=function(){
            this.moveright.start()

    };

})();;
(function(){

    /* Hotspot base class for all spot
     * @poly spot infospot
     */
    XPANOL.Hotspot = function () {

        var scope = this, ratio, startScale, endScale, duration;

        this.scale = 300;
        duration = 500;
        this.animated = true;
        this.isHovering = false;

        this.mode = XPANOL.Modes.UNKNOWN;
        //this.rotation.y = Math.PI;
        this.element;
        this.container;

    }
    /**
     * Set Hotspot container
     * @param  data - Data with container information
     */
    XPANOL.Hotspot.prototype.setContainer = function ( data ) {

        var container;
        //TODO : Creat A continer handler
        this.container = container;

    };

    /**
     * Get container
     * @return The container of this Hotspot
     */
    XPANOL.Hotspot.prototype.getContainer = function () {

        return this.container;

    };
    /**
     * This will be called by a click event
     * Translate and lock the hovering element if any
     * @param  {object} event - Event containing mouseEvent with clientX and clientY
     */
    XPANOL.Hotspot.prototype.onClick = function ( event ) {

        if ( this.element && this.getContainer() ) {



        }

    };



})();;
(function(){

    XPANOL.Infospot = function (x,y,z,distance) {

            var spriteMap = new THREE.TextureLoader().load( "file:///E:/zxc/DRM/Photo-Sphere-Viewer-3.2.3/example/pin.png"  );
            spriteMap.wrapS = THREE.RepeatWrapping;
            spriteMap.repeat.x = - 1;
            var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff,transparent:true } );
            this.sprite = new THREE.Sprite( spriteMaterial );
            XPANOL.Hotspot.call(this.sprite);
            this.sprite.scaleFactor = 1.3;
            this.sprite.position.set(x,y,z);
            this.sprite.scale.set(50,50,0 );

            var duration=500
            var startScale = this.sprite.scale.clone();

            this.sprite.scaleUpAnimation = new TWEEN.Tween( this.sprite.scale )
                .to( { x: startScale.x * this.sprite.scaleFactor, y: startScale.y * this.sprite.scaleFactor }, duration )
                .easing( TWEEN.Easing.Elastic.Out );

            this.sprite.scaleDownAnimation = new TWEEN.Tween( this.sprite.scale )
                .to( { x: startScale.x, y: startScale.y }, duration )
                .easing( TWEEN.Easing.Elastic.Out );
      }

      XPANOL.Infospot.prototype.getInfospot =function(){

          return this.sprite;
    }
    /*
    * This will be called by a mouse hover event
    * Translate the hovering element if any
    *
    */
     XPANOL.Infospot.prototype.onHover = function () {
          this.sprite.scaleUpAnimation.start();
          this.sprite.scaleDownAnimation.stop();

         if(this.sprite.element){

             var postion=XPANOL.getScreenVector(this.sprite.getWorldPosition());
             var x=postion.x
             var y=postion.y
             this.sprite.element.visible=true;
             this.sprite.element.x=x-this.sprite.element.width/2;
             this.sprite.element.y=y-70;
         }
     };
    XPANOL.Infospot.prototype.onHoverEnd= function(){

        this.sprite.scaleUpAnimation.stop();
        this.sprite.scaleDownAnimation.start();
         if(this.sprite.element){
            this.sprite.element.visible=false
         }
    }

    XPANOL.Infospot.prototype.setElemt=function(text){

        var postion=XPANOL.getScreenVector(this.sprite.getWorldPosition());
        var x=postion.x
        var y=postion.y
        var component = Qt.createComponent("TextElement.qml");
        var elemnt = component.createObject(XPANOL.canvas, {"x":x,"y":y,"visible":false});
        elemnt.text.text=text
        this.sprite.element=elemnt
    }
})();

(function(){

    /**
     * Equirectangular based Video panorama
     * @constructor
     * @xpanol {string} video - Video
     * @xpanol {number} [radius=5000] - Radius of panorama
     */
    XPANOL.VideoPanorama = function ( image, radius ) {

        radius = radius || 5000;
        var texture = new THREE.QtQuickItemTexture( image );
        texture.repeat = new THREE.Vector2( 1, 1 );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        var material	= new THREE.MeshBasicMaterial({
            map	: texture,
            color:"white",
            side	: THREE.BackSide
        })
        var geometry	= new THREE.SphereGeometry(radius, 32, 32)
        this.mesh	= new THREE.Mesh(geometry, material)
       // XPANOL.Panorama.call(this.mesh)
        return this.mesh

    };

    XPANOL.VideoPanorama.prototype.getpanorama=function(){
          return this.mesh
    };

})();;
(function(){
    /**
     * cube with Arrow imagw for navgation
     * @constructor
     * @param {string} picture - Image
     * @param {number} [type] - left || right || back || front
     */
    var creater=function(path){
        var texture	= new THREE.TextureLoader().load(path)
        var mesh=new THREE.MeshBasicMaterial({map :texture, side:THREE.DoubleSide})
        return mesh
    }

    /*
     *
     */

    XPANOL.Arrow= function(type){

        var picture="qrc:/image/arrow.png"
        //Intial and creating
        var gemotry=new THREE.BoxGeometry(100,10,100)
        var cubematrial=[
            creater(picture), //right side
            creater(picture), //Left side
            creater(picture), //top side
            creater(picture), //Bottom side
            creater(picture), //Front side
            creater(picture) //back side

        ]

        var matt=new THREE.MeshFaceMaterial(cubematrial)
        this.mesh = new THREE.Mesh(gemotry,matt)
        this.mesh.position.set(500,-600,-600)

        this.mesh.datatype="arrow"
        this.mesh.type=type;
        var duration=500
        var startScale = this.mesh.scale.clone();

        this.mesh.scaleUpAnimation = new TWEEN.Tween( this.mesh.scale )
            .to( { x: startScale.x * 1.25, y: startScale.y * 1.25 ,z:startScale.z * 1.25}, duration )
            .easing( TWEEN.Easing.Elastic.Out );

        this.mesh.scaleDownAnimation = new TWEEN.Tween( this.mesh.scale )
            .to( { x: startScale.x, y: startScale.y ,z:startScale.z}, duration )
            .easing( TWEEN.Easing.Elastic.Out );

        // Type of arrow
        this.offset={x:0,y:0,z:0}
        if(this.mesh.type ===XPANOL.Arrows.right){
            this.mesh.rotation.y=-180*3.14/180;;
            this.offset={x:-150,y:0,z:150}
        }
        else if(this.mesh.type ===XPANOL.Arrows.left){
            this.mesh.rotation.y=0
            this.offset={x:150,y:0,z:150}
        }
        else if(this.mesh.type===XPANOL.Arrows.front){
            this.mesh.rotation.y=90*3.14/180
            this.offset={x:0,y:0,z:0}
        }
        else if(this.mesh.type === XPANOL.Arrows.back){
            this.mesh.rotation.y=-90*3.14/180;
            this.offset={x:0,y:0,z:300}
        }
    }
   /*
    * get Arrow FUnction
    */
    XPANOL.Arrow.prototype.getArrow =function(){

        return this.mesh;
    }
   /*
    * This will be called by a mouse hover event
    * Translate the hovering element if any
    *
    */
     XPANOL.Arrow.prototype.onHover = function () {
          this.mesh.scaleUpAnimation.start();
          this.mesh.scaleDownAnimation.stop();

     };
   /*
    * This will be called by a mouse hover event ended
    * Translate the hovering element if any
    *
    */
     XPANOL.Arrow.prototype.onHoverEnd= function(){

        this.mesh.scaleUpAnimation.stop();
        this.mesh.scaleDownAnimation.start();

    }
    /*
     * get camera angle for arrow
     * @param {number} [phy] 0-180
     * @param {number} theta 0-360
     */
     XPANOL.Arrow.prototype.onPhitheta = function(phy,theta){

         var x=800*Math.sin( phy ) * Math.sin( theta);
         var y=800* Math.cos( phy+0.45 );
         var z=800*Math.sin( phy ) * Math.cos( theta );

         this.mesh.position.set(x+this.offset.x,y+this.offset.y,z+this.offset.z)

     }

}
)();;
