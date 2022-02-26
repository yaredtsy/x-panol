import QtQuick 2.0

Rectangle{

       rotation: 90
       layer.enabled: true
       layer.smooth: true
       id: sou
       height: panpic.sourceSize.height/*>4096?4096:panpic.sourceSize.height*/
       width: panpic.sourceSize.width/*>8192?8192:panpic.sourceSize.width*/
           Image{
               id: panpic
               anchors.fill: parent
               z: 2
               rotation: 180
               source:  "file:///E:/zxc/DRM/panolens.js-master/example/asset/textures/equirectangular/building.jpg"

           }
   }
