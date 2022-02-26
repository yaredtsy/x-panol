/****************************************************************************
**
** Copyright (C) 2016 The Qt Company Ltd.
** Contact: https://www.qt.io/licensing/
**
** This file is part of the QtCanvas3D module of the Qt Toolkit.
**
** $QT_BEGIN_LICENSE:BSD$
** Commercial License Usage
** Licensees holding valid commercial Qt licenses may use this file in
** accordance with the commercial license agreement provided with the
** Software or, alternatively, in accordance with the terms contained in
** a written agreement between you and The Qt Company. For licensing terms
** and conditions see https://www.qt.io/terms-conditions. For further
** information use the contact form at https://www.qt.io/contact-us.
**
** BSD License Usage
** Alternatively, you may use this file under the terms of the BSD license
** as follows:
**
** "Redistribution and use in source and binary forms, with or without
** modification, are permitted provided that the following conditions are
** met:
**   * Redistributions of source code must retain the above copyright
**     notice, this list of conditions and the following disclaimer.
**   * Redistributions in binary form must reproduce the above copyright
**     notice, this list of conditions and the following disclaimer in
**     the documentation and/or other materials provided with the
**     distribution.
**   * Neither the name of The Qt Company Ltd nor the names of its
**     contributors may be used to endorse or promote products derived
**     from this software without specific prior written permission.
**
**
** THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
** "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
** LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
** A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
** OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
** LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
** DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
** THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
** (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
** OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."
**
** $QT_END_LICENSE$
**
****************************************************************************/

import QtQuick 2.0

// Helper class that makes QtQuick mouse and keyboard events more easier to handle in
// HTML compatible manner
//var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };
//this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
Item {
    id: ctrlEventSource
    property alias eventh: eventh
    EVENt{
        id:eventh

    }
    focus: true
    property bool touchable: false
    property alias cursorShape: inputArea.cursorShape

    signal mouseMove(EVENt ev);
    signal mouseDown(EVENt ev);
    signal mouseUp(int x, int y);
    signal mouseWheel(int x, int y);
    signal mouseIn();
    signal mouseOut();

    signal keyDown(EVENt ev);
    signal keyUp(EVENt ev);

    function addEventListener(event, handler, ignored)
    {
        if (event === 'keydown') {
            ctrlEventSource.keyDown.connect(handler);
        } else if (event === 'keyup') {
            ctrlEventSource.keyUp.connect(handler);
        } else if (event === 'mousedown') {
            ctrlEventSource.mouseDown.connect(handler);
        } else if (event === 'mouseup') {
            ctrlEventSource.mouseUp.connect(handler);
        } else if (event === 'mousemove') {
            ctrlEventSource.mouseMove.connect(handler);
        } else if (event === 'mousewheel') {
            ctrlEventSource.mouseWheel.connect(handler);
        } else if (event === 'mouseout') {
            ctrlEventSource.mouseOut.connect(handler);
        } else if (event === 'mousein') {
            ctrlEventSource.mouseIn.connect(handler);
        } else if (event === 'touchstart') {
        } else if (event === 'touchmove') {
        } else if (event === 'touchend') {
        }
    }

    function removeEventListener(event, handler, ignored)
    {
        if (event === 'keydown') {
            ctrlEventSource.keyDown.disconnect(handler);
        } else if (event === 'keyup') {
            ctrlEventSource.keyUp.disconnect(handler);
        } else if (event === 'mousedown') {
            ctrlEventSource.mouseDown.disconnect(handler);
        } else if (event === 'mouseup') {
            ctrlEventSource.mouseUp.disconnect(handler);
        } else if (event === 'mousemove') {
            ctrlEventSource.mouseMove.disconnect(handler);
        } else if (event === 'mousewheel') {
            ctrlEventSource.mouseWheel.disconnect(handler);
        } else if (event === 'mouseout') {
            ctrlEventSource.mouseOut.disconnect(handler);
        } else if (event === 'mouseout') {
            ctrlEventSource.mouseIn.disconnect(handler);
        } else if (event === 'touchstart') {
        } else if (event === 'touchmove') {
        } else if (event === 'touchend') {
        }
    }

    MouseArea {
        id: inputArea
        anchors.fill: parent
        hoverEnabled: true

        onPositionChanged: {
            eventh.clientX=mouse.x
            eventh.clientY=mouse.y
            ctrlEventSource.mouseMove(eventh);
        }

        onPressed: {
            eventh.clientX=mouse.x
            eventh.clientY=mouse.y
            eventh.button=1

            ctrlEventSource.mouseDown(eventh);
        }

        onReleased: {
            ctrlEventSource.mouseUp(mouse.x, mouse.y);
        }

        onWheel: {
            ctrlEventSource.mouseWheel(wheel.angleDelta.x, wheel.angleDelta.y);
        }

        onEntered: {
            eventh.clientX=mouseX
            eventh.clientY=mouseY
            ctrlEventSource.mouseIn();
        }

        onExited: {
            ctrlEventSource.mouseOut();
        }
        onFocusChanged: {
            focus=true
        }
    }

    Keys.onPressed: {

        if (event.key ==Qt.Key_Left)
            eventh.keyCode=37
        else if(event.key == Qt.Key_Right)
            eventh.keyCode=39
        else if(event.key==Qt.Key_Up)
            eventh.keyCode=38
        else if(event.key==Qt.Key_Down)
            eventh.keyCode=40
        else if(event.key==Qt.Key_Shift){
            eventh.keyCode=43
        }
        else
            eventh.keyCode=0
        ctrlEventSource.keyDown(eventh);
    }

    Keys.onReleased: {
        if (event.key==Qt.Key_Left)
            eventh.keyCode=37
        else if(event.key==Qt.Key_Right)
            eventh.keyCode=39
        else if(event.key==Qt.Key_Up)
            eventh.keyCode=38
        else if(event.key==Qt.Key_Down)
            eventh.keyCode=40
        else if(event.key===Qt.Key_W)
             eventh.keyCode=41
        else
            eventh.keyCode=0
        ctrlEventSource.keyUp(eventh);
    }

    onTouchableChanged: {
        if(touchable===true){
            inputArea.cursorShape=Qt.PointingHandCursor
        }
        else if(touchable===false)
            inputArea.cursorShape=Qt.ArrowCursor
    }
    onFocusChanged: {
        focus=true
    }
}

