import QtQuick 2.0

Rectangle {
    property alias text: name
    width: name.text.length*15
    height: 34
    visible:true
    color: "black"

    radius: 10
    Text {

        anchors.centerIn: parent

        id: name
        text: qsTr("Lopesm eoream")
        font.pointSize: 16
        color: "white"
    }

    NumberAnimation on scale{
        id: widani
        from: 0.75
        to: 1.25
        easing.type: Easing.OutElastic
        duration: 500
    }
    onVisibleChanged: {
        if(visible){
           // heian.start()
            widani.start()
        }
    }
}
