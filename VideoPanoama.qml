import QtQuick 2.0
import QtQuick 2.0
import QtAV 1.7
Rectangle{
       z: -1
       signal finshed()
       layer.enabled: true
       layer.smooth: true
       id: sou
       height: videoout.sourceRect.height>720?720:videoout.sourceRect.height
       width: videoout.sourceRect.width>1280?1280:videoout.sourceRect.width
       onWidthChanged: {

           finshed()
       }
       AVPlayer{
           id:player
           source: "file:///E:/zxc/DRM/m.mp4"
           autoPlay: true
       }
       VideoOutput2{

           id: videoout
           rotation: 180
           source: player
           anchors.fill: parent


       }
 }
