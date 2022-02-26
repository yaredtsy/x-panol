import QtQuick 2.4
import QtCanvas3D 1.1
import QtQuick.Window 2.2

import "glcode.js" as GLCode

Window {
    title: qsTr("xpanol2")
    width: 1280
    height: 768
    visible: true

    Canvas3D {
        id: canvas3d
        anchors.fill: parent
        focus: true

        onInitializeGL: {
            GLCode.initializeGL(canvas3d);
            GLCode.setImagePanoram("")
        }

        onPaintGL: {
            GLCode.paintGL(canvas3d);
        }

        onResizeGL: {
            GLCode.resizeGL(canvas3d);
        }
        ControlEventSource {
            anchors.fill: parent
            focus: true
            id: eventSource
        }


        function addEventListener(type,fun,bool){
            eventSource.addEventListener(type,fun,bool)
        }
        function removeEventListener(type,fun,bool){
            eventSource.removeEventListener(type,fun,bool)
        }

    }
}
