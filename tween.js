var TWEEN = TWEEN || (function () {

    var _tweens = [];

    return {

        getAll: function () {

            return _tweens;

        },

        removeAll: function () {

            _tweens = [];

        },

        add: function (tween) {

            _tweens.push(tween);

        },

        remove: function (tween) {

            var i = _tweens.indexOf(tween);

            if (i !== -1) {
                _tweens.splice(i, 1);
            }

        },

        update: function (time, preserve) {

            if (_tweens.length === 0) {
                return false;
            }

            var i = 0;

            time = time? time : TWEEN.now();

            while (i < _tweens.length) {

                if (_tweens[i].update(time) || preserve) {
                    i++;
                } else {
                    _tweens.splice(i, 1);
                }

            }

            return true;

        }
    };

})();


// Include a performance.now polyfill.
// In node.js, use process.hrtime.
if (typeof (window) === 'undefined' && typeof (process) !== 'undefined') {
    TWEEN.now = function () {
        var time = process.hrtime();

        // Convert [seconds, nanoseconds] to milliseconds.
        return time[0] * 1000 + time[1] / 1000000;
    };
}
// In a browser, use window.performance.now if it is available.
else if (typeof (window) !== 'undefined' &&
         window.performance !== undefined &&
         window.performance.now !== undefined) {
    // This must be bound, because directly assigning this function
    // leads to an invocation exception in Chrome.
    TWEEN.now = window.performance.now.bind(window.performance);
}
// Use Date.now if it is available.
else if (Date.now !== undefined) {
    TWEEN.now = Date.now;
}
// Otherwise, use 'new Date().getTime()'.
else {
    TWEEN.now = function () {
        return new Date().getTime();
    };
}


TWEEN.Tween = function (object) {

    var _object = object;
    var _valuesStart = {};
    var _valuesEnd = {};
    var _valuesStartRepeat = {};
    var _duration = 1000;
    var _repeat = 0;
    var _repeatDelayTime;
    var _yoyo = false;
    var _isPlaying = false;
    var _reversed = false;
    var _delayTime = 0;
    var _startTime = null;
    var _easingFunction = TWEEN.Easing.Linear.None;
    var _interpolationFunction = TWEEN.Interpolation.Linear;
    var _chainedTweens = [];
    var _onStartCallback = null;
    var _onStartCallbackFired = false;
    var _onUpdateCallback = null;
    var _onCompleteCallback = null;
    var _onStopCallback = null;

    this.to = function (properties, duration) {

        _valuesEnd = properties;

        if (duration !== undefined) {
            _duration = duration;
        }

        return this;

    };

    this.start = function (time) {

        TWEEN.add(this);

        _isPlaying = true;

        _onStartCallbackFired = false;

        _startTime = time !== undefined ? time : TWEEN.now();
        _startTime += _delayTime;

        for (var property in _valuesEnd) {

            // Check if an Array was provided as property value
            if (_valuesEnd[property] instanceof Array) {

                if (_valuesEnd[property].length === 0) {
                    continue;
                }

                // Create a local copy of the Array with the start value at the front
                _valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

            }

            // If `to()` specifies a property that doesn't exist in the source object,
            // we should not set that property in the object
            if (_object[property] === undefined) {
                continue;
            }

            // Save the starting value.
            _valuesStart[property] = _object[property];

            if ((_valuesStart[property] instanceof Array) === false) {
                _valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
            }

            _valuesStartRepeat[property] = _valuesStart[property] || 0;

        }

        return this;

    };

    this.stop = function () {

        if (!_isPlaying) {
            return this;
        }

        TWEEN.remove(this);
        _isPlaying = false;

        if (_onStopCallback !== null) {
            _onStopCallback.call(_object, _object);
        }

        this.stopChainedTweens();
        return this;

    };

    this.end = function () {

        this.update(_startTime + _duration);
        return this;

    };

    this.stopChainedTweens = function () {

        for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
            _chainedTweens[i].stop();
        }

    };

    this.delay = function (amount) {

        _delayTime = amount;
        return this;

    };

    this.repeat = function (times) {

        _repeat = times;
        return this;

    };

    this.repeatDelay = function (amount) {

        _repeatDelayTime = amount;
        return this;

    };

    this.yoyo = function (yoyo) {

        _yoyo = yoyo;
        return this;

    };


    this.easing = function (easing) {

        _easingFunction = easing;
        return this;

    };

    this.interpolation = function (interpolation) {

        _interpolationFunction = interpolation;
        return this;

    };

    this.chain = function () {

        _chainedTweens = arguments;
        return this;

    };

    this.onStart = function (callback) {

        _onStartCallback = callback;
        return this;

    };

    this.onUpdate = function (callback) {

        _onUpdateCallback = callback;
        return this;

    };

    this.onComplete = function (callback) {

        _onCompleteCallback = callback;
        return this;

    };

    this.onStop = function (callback) {

        _onStopCallback = callback;
        return this;

    };

    this.update = function (time) {

        var property;
        var elapsed;
        var value;

        if (time < _startTime) {
            return true;
        }

        if (_onStartCallbackFired === false) {

            if (_onStartCallback !== null) {
                _onStartCallback.call(_object, _object);
            }

            _onStartCallbackFired = true;
        }

        elapsed = (time - _startTime) / _duration;
        elapsed = elapsed > 1 ? 1 : elapsed;

        value = _easingFunction(elapsed);

        for (property in _valuesEnd) {

            // Don't update properties that do not exist in the source object
            if (_valuesStart[property] === undefined) {
                continue;
            }

            var start = _valuesStart[property] || 0;
            var end = _valuesEnd[property];

            if (end instanceof Array) {

                _object[property] = _interpolationFunction(end, value);

            } else {

                // Parses relative end values with start as base (e.g.: +10, -3)
                if (typeof (end) === 'string') {

                    if (end.charAt(0) === '+' || end.charAt(0) === '-') {
                        end = start + parseFloat(end);
                    } else {
                        end = parseFloat(end);
                    }
                }

                // Protect against non numeric properties.
                if (typeof (end) === 'number') {
                    _object[property] = start + (end - start) * value;
                }

            }

        }

        if (_onUpdateCallback !== null) {
            _onUpdateCallback.call(_object, value);
        }

        if (elapsed === 1) {

            if (_repeat > 0) {

                if (isFinite(_repeat)) {
                    _repeat--;
                }

                // Reassign starting values, restart by making startTime = now
                for (property in _valuesStartRepeat) {

                    if (typeof (_valuesEnd[property]) === 'string') {
                        _valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property]);
                    }

                    if (_yoyo) {
                        var tmp = _valuesStartRepeat[property];

                        _valuesStartRepeat[property] = _valuesEnd[property];
                        _valuesEnd[property] = tmp;
                    }

                    _valuesStart[property] = _valuesStartRepeat[property];

                }

                if (_yoyo) {
                    _reversed = !_reversed;
                }

                if (_repeatDelayTime !== undefined) {
                    _startTime = time + _repeatDelayTime;
                } else {
                    _startTime = time + _delayTime;
                }

                return true;

            } else {

                if (_onCompleteCallback !== null) {

                    _onCompleteCallback.call(_object, _object);
                }

                for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
                    // Make the chained tweens start exactly at the time they should,
                    // even if the `update()` method was called way past the duration of the tween
                    _chainedTweens[i].start(_startTime + _duration);
                }

                return false;

            }

        }

        return true;

    };

};


TWEEN.Easing = {

    Linear: {

        None: function (k) {

            return k;

        }

    },

    Quadratic: {

        In: function (k) {

            return k * k;

        },

        Out: function (k) {

            return k * (2 - k);

        },

        InOut: function (k) {

            if ((k *= 2) < 1) {
                return 0.5 * k * k;
            }

            return - 0.5 * (--k * (k - 2) - 1);

        }

    },

    Cubic: {

        In: function (k) {

            return k * k * k;

        },

        Out: function (k) {

            return --k * k * k + 1;

        },

        InOut: function (k) {

            if ((k *= 2) < 1) {
                return 0.5 * k * k * k;
            }

            return 0.5 * ((k -= 2) * k * k + 2);

        }

    },

    Quartic: {

        In: function (k) {

            return k * k * k * k;

        },

        Out: function (k) {

            return 1 - (--k * k * k * k);

        },

        InOut: function (k) {

            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k;
            }

            return - 0.5 * ((k -= 2) * k * k * k - 2);

        }

    },

    Quintic: {

        In: function (k) {

            return k * k * k * k * k;

        },

        Out: function (k) {

            return --k * k * k * k * k + 1;

        },

        InOut: function (k) {

            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k * k;
            }

            return 0.5 * ((k -= 2) * k * k * k * k + 2);

        }

    },

    Sinusoidal: {

        In: function (k) {

            return 1 - Math.cos(k * Math.PI / 2);

        },

        Out: function (k) {

            return Math.sin(k * Math.PI / 2);

        },

        InOut: function (k) {

            return 0.5 * (1 - Math.cos(Math.PI * k));

        }

    },

    Exponential: {

        In: function (k) {

            return k === 0 ? 0 : Math.pow(1024, k - 1);

        },

        Out: function (k) {

            return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

        },

        InOut: function (k) {

            if (k === 0) {
                return 0;
            }

            if (k === 1) {
                return 1;
            }

            if ((k *= 2) < 1) {
                return 0.5 * Math.pow(1024, k - 1);
            }

            return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

        }

    },

    Circular: {

        In: function (k) {

            return 1 - Math.sqrt(1 - k * k);

        },

        Out: function (k) {

            return Math.sqrt(1 - (--k * k));

        },

        InOut: function (k) {

            if ((k *= 2) < 1) {
                return - 0.5 * (Math.sqrt(1 - k * k) - 1);
            }

            return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

        }

    },

    Elastic: {

        In: function (k) {

            if (k === 0) {
                return 0;
            }

            if (k === 1) {
                return 1;
            }

            return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);

        },

        Out: function (k) {

            if (k === 0) {
                return 0;
            }

            if (k === 1) {
                return 1;
            }

            return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;

        },

        InOut: function (k) {

            if (k === 0) {
                return 0;
            }

            if (k === 1) {
                return 1;
            }

            k *= 2;

            if (k < 1) {
                return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
            }

            return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;

        }

    },

    Back: {

        In: function (k) {

            var s = 1.70158;

            return k * k * ((s + 1) * k - s);

        },

        Out: function (k) {

            var s = 1.70158;

            return --k * k * ((s + 1) * k + s) + 1;

        },

        InOut: function (k) {

            var s = 1.70158 * 1.525;

            if ((k *= 2) < 1) {
                return 0.5 * (k * k * ((s + 1) * k - s));
            }

            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

        }

    },

    Bounce: {

        In: function (k) {

            return 1 - TWEEN.Easing.Bounce.Out(1 - k);

        },

        Out: function (k) {

            if (k < (1 / 2.75)) {
                return 7.5625 * k * k;
            } else if (k < (2 / 2.75)) {
                return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
            } else if (k < (2.5 / 2.75)) {
                return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
            } else {
                return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
            }

        },

        InOut: function (k) {

            if (k < 0.5) {
                return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
            }

            return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

        }

    }

};

TWEEN.Interpolation = {

    Linear: function (v, k) {

        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);
        var fn = TWEEN.Interpolation.Utils.Linear;

        if (k < 0) {
            return fn(v[0], v[1], f);
        }

        if (k > 1) {
            return fn(v[m], v[m - 1], m - f);
        }

        return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

    },

    Bezier: function (v, k) {

        var b = 0;
        var n = v.length - 1;
        var pw = Math.pow;
        var bn = TWEEN.Interpolation.Utils.Bernstein;

        for (var i = 0; i <= n; i++) {
            b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
        }

        return b;

    },

    CatmullRom: function (v, k) {

        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);
        var fn = TWEEN.Interpolation.Utils.CatmullRom;

        if (v[0] === v[m]) {

            if (k < 0) {
                i = Math.floor(f = m * (1 + k));
            }

            return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

        } else {

            if (k < 0) {
                return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
            }

            if (k > 1) {
                return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            }

            return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

        }

    },

    Utils: {

        Linear: function (p0, p1, t) {

            return (p1 - p0) * t + p0;

        },

        Bernstein: function (n, i) {

            var fc = TWEEN.Interpolation.Utils.Factorial;

            return fc(n) / fc(i) / fc(n - i);

        },

        Factorial: (function () {

            var a = [1];

            return function (n) {

                var s = 1;

                if (a[n]) {
                    return a[n];
                }

                for (var i = n; i > 1; i--) {
                    s *= i;
                }

                a[n] = s;
                return s;

            };

        })(),

        CatmullRom: function (p0, p1, p2, p3, t) {

            var v0 = (p2 - p0) * 0.5;
            var v1 = (p3 - p1) * 0.5;
            var t2 = t * t;
            var t3 = t * t2;

            return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

        }

    }

};

// UMD (Universal Module Definition)
(function (root) {

    if (typeof define === 'function' && define.amd) {

        // AMD
        define([], function () {
            return TWEEN;
        });

    } else if (typeof module !== 'undefined' && typeof exports === 'object') {

        // Node.js
        module.exports = TWEEN;

    } else if (root !== undefined) {

        // Global variable
        root.TWEEN = TWEEN;

    }

})(this);
;/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
/*global THREE, console */

// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
// supported.
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe

var doomel;

THREE.OrbitControls = function ( object, domElement ) {

    this.object = object;
    this.domElement = ( domElement !== undefined ) ? domElement : document;
    doomel=this.domElement
    this.frameId;

    // API

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the control orbits around
    // and where it pans with respect to.
    this.target = new THREE.Vector3();

    // center is old, deprecated; use "target" instead
    this.center = this.target;

    // This option actually enables dollying in and out; left as "zoom" for
    // backwards compatibility
    this.noZoom = false;
    this.zoomSpeed = 1.0;
    var clintx,clinty;
    // Limits to how far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // Limits to how far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;

    // Set to true to disable this control
    this.noRotate = false;
    this.rotateSpeed = -0.15;

    // Set to true to disable this control
    this.noPan = true;
    this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // Momentum
    this.momentumDampingFactor = 0.90;
    this.momentumScalingFactor = -0.005;
    this.momentumKeydownFactor = 20;

    // Fov
    this.minFov = 30;
    this.maxFov = 120;

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = - Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to disable use of the keys
    this.noKeys = false;

    // The four arrow keys
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    // Mouse buttons
    this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

    ////////////
    // internals

    var scope = this;

    var EPS = 10e-8;
    var MEPS = 10e-5;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();
    var panOffset = new THREE.Vector3();

    var offset = new THREE.Vector3();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    var theta;
    var phi;
    var phiDelta = 0;
    var thetaDelta = 0;
    var scale = 1;
    var pan = new THREE.Vector3();

    var lastPosition = new THREE.Vector3();
    var lastQuaternion = new THREE.Quaternion();


    var momentumLeft = 0, momentumUp = 0;
    var eventCurrent, eventPrevious;
    var momentumOn = false;

    var keyUp, keyBottom, keyLeft, keyRight;

    var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

    var state = STATE.NONE;

    // for reset

    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;

    // so camera.up is the orbit axis

    var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
    var quatInverse = quat.clone().inverse();

    // events

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start' };
    var endEvent = { type: 'end' };

    this.setLastQuaternion = function ( quaternion ) {
        lastQuaternion.copy( quaternion );
        scope.object.quaternion.copy( quaternion );
    };

    this.getLastPosition = function () {
        return lastPosition;
    }

    this.rotateLeft = function ( angle ) {

        if ( !angle  ) {

            angle = getAutoRotationAngle();

        }

        thetaDelta -= angle;


    };

    this.rotateUp = function ( angle ) {

        if ( !angle) {

            angle = getAutoRotationAngle();

        }

        phiDelta -= angle;

    };

    // pass in distance in world space to move left
    this.panLeft = function ( distance ) {

        var te = this.object.matrix.elements;

        // get X column of matrix
        panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] );
        panOffset.multiplyScalar( - distance );

        pan.add( panOffset );

    };

    // pass in distance in world space to move up
    this.panUp = function ( distance ) {

        var te = this.object.matrix.elements;

        // get Y column of matrix
        panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] );
        panOffset.multiplyScalar( distance );

        pan.add( panOffset );

    };

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    this.pan = function ( deltaX, deltaY ) {

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        if ( scope.object instanceof THREE.PerspectiveCamera ) {

            // perspective
            var position = scope.object.position;
            var offset = position.clone().sub( scope.target );
            var targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            scope.panLeft( 2 * deltaX * targetDistance / doomel.width );
            scope.panUp( 2 * deltaY * targetDistance / doomel.height );

        } else if ( scope.object instanceof THREE.OrthographicCamera ) {

            // orthographic
            scope.panLeft( deltaX * (scope.object.right - scope.object.left) / doomel.width );
            scope.panUp( deltaY * (scope.object.top - scope.object.bottom) / doomel.height );

        } else {

            // camera neither orthographic or perspective
            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

        }

    };

    this.momentum = function(){

        if ( !momentumOn ) return;

        if ( Math.abs( momentumLeft ) < MEPS && Math.abs( momentumUp ) < MEPS ) {

            momentumOn = false;
            //return;
        }

        momentumUp   *= this.momentumDampingFactor;
        momentumLeft *= this.momentumDampingFactor;

        thetaDelta -= this.momentumScalingFactor * momentumLeft;
        phiDelta   -= this.momentumScalingFactor * momentumUp;

    };

    this.dollyIn = function ( dollyScale ) {

        if ( !dollyScale) {

            dollyScale = getZoomScale();

        }

        if ( scope.object instanceof THREE.PerspectiveCamera ) {

            scale /= dollyScale;

        } else if ( scope.object instanceof THREE.OrthographicCamera ) {

            scope.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom * dollyScale ) );
            scope.object.updateProjectionMatrix();
            scope.dispatchEvent( changeEvent );

        } else {

            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );

        }

    };

    this.dollyOut = function ( dollyScale ) {

        if (! dollyScale) {

            dollyScale = getZoomScale();

        }

        if ( scope.object instanceof THREE.PerspectiveCamera ) {

            scale *= dollyScale;

        } else if ( scope.object instanceof THREE.OrthographicCamera ) {

            scope.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom / dollyScale ) );
            scope.object.updateProjectionMatrix();
            scope.dispatchEvent( changeEvent );

        } else {

            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );

        }

    };

    this.update = function ( ignoreUpdate ) {

        var position = this.object.position;

        offset.copy( position ).sub( this.target );

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion( quat );

        // angle from z-axis around y-axis

        theta = Math.atan2( offset.x, offset.z );

        // angle from y-axis

        phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

        if ( this.autoRotate && state === STATE.NONE ) {

            this.rotateLeft( getAutoRotationAngle() );

        }

        this.momentum();

        theta += thetaDelta;
        phi +=phiDelta;

        // restrict theta to be between desired limits
        theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, theta ) );

        // restrict phi to be between desired limits
        phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

        // restrict phi to be betwee EPS and PI-EPS
        phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

        var radius = offset.length() * scale;

        // restrict radius to be between desired limits
        radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

        // move target to panned location
        this.target.add( pan );

        offset.x = radius * Math.sin( phi ) * Math.sin( theta );
        offset.y = radius * Math.cos( phi );
        offset.z = radius * Math.sin( phi ) * Math.cos( theta );

        //trigering signal


        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion( quatInverse );

        position.copy( this.target ).add( offset );

        this.object.lookAt( this.target );

        thetaDelta = 0;

        phiDelta = 0;
        scale = 1;
        pan.set( 0, 0, 0 );

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8
        if ( lastPosition.distanceToSquared( this.object.position ) > EPS
            || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS ) {

            ignoreUpdate !== true && this.dispatchEvent( changeEvent );

            lastPosition.copy( this.object.position );
            lastQuaternion.copy (this.object.quaternion );

        }

    };


    this.reset = function () {

        state = STATE.NONE;

        this.target.copy( this.target0 );
        this.object.position.copy( this.position0 );
        this.object.zoom = this.zoom0;

        this.object.updateProjectionMatrix();
        this.dispatchEvent( changeEvent );

        this.update();

    };

    this.getPolarAngle = function () {

        return phi;

    };

    this.getAzimuthalAngle = function () {

        return theta

    };

    function getAutoRotationAngle() {

        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

    }

    function getZoomScale() {

        return Math.pow( 0.95, scope.zoomSpeed );

    }

    function onMouseDown( event ) {

        momentumOn = false;

        momentumLeft = momentumUp = 0;

        if ( scope.enabled === false ) return;
        //event.preventDefault();

        if ( event.button === scope.mouseButtons.ORBIT ) {
            if ( scope.noRotate === true ) return;

            state = STATE.ROTATE;

            rotateStart.set( event.clientX, event.clientY );

        } else if ( event.button === scope.mouseButtons.ZOOM ) {
            if ( scope.noZoom === true ) return;

            state = STATE.DOLLY;

            dollyStart.set( event.clientX, event.clientY );

        } else if ( event.button === scope.mouseButtons.PAN ) {
            if ( scope.noPan === true ) return;

            state = STATE.PAN;

            panStart.set( event.clientX, event.clientY );

        }

        if ( state !== STATE.NONE ) {


            doomel.addEventListener( 'mousemove', onMouseMove, false );
            doomel.addEventListener( 'mouseup', onMouseUp, false );
            scope.dispatchEvent( startEvent );
        }

        scope.update();

    }

    function onMouseMove( event ) {

        if ( scope.enabled === false ) return;

        //event.preventDefault();

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        if ( state === STATE.ROTATE ) {

            if ( scope.noRotate === true ) return;

            rotateEnd.set( event.clientX, event.clientY );
            rotateDelta.subVectors( rotateEnd, rotateStart );

           // rotating across whole screen goes 360 degrees around
           scope.rotateLeft( 2 * Math.PI * rotateDelta.x / doomel.width * scope.rotateSpeed );

           // rotating up and down along whole screen attempts to go 360, but limited to 180
           scope.rotateUp( 2 * Math.PI * rotateDelta.y / doomel.height * scope.rotateSpeed );

            rotateStart.copy( rotateEnd );

            if( eventPrevious ){

                momentumLeft = event.clientX - clintx;
                momentumUp = event.clientY - clinty;
            }


            eventPrevious = event;
            clintx=event.clientX
            clinty=event.clientY

        } else if ( state === STATE.DOLLY ) {

            if ( scope.noZoom === true ) return;

            dollyEnd.set( event.clientX, event.clientY );
            dollyDelta.subVectors( dollyEnd, dollyStart );

            if ( dollyDelta.y > 0 ) {

                scope.dollyIn();

            } else if ( dollyDelta.y < 0 ) {

                scope.dollyOut();

            }

            dollyStart.copy( dollyEnd );

        } else if ( state === STATE.PAN ) {

            if ( scope.noPan === true ) return;

            panEnd.set( event.clientX, event.clientY );
            panDelta.subVectors( panEnd, panStart );

            scope.pan( panDelta.x, panDelta.y );

            panStart.copy( panEnd );

        }

        if ( state !== STATE.NONE ) scope.update();

    }

    function onMouseUp( /* event */ ) {

        momentumOn = true;

        eventPrevious = undefined;

        if ( scope.enabled === false ) return;

        doomel.removeEventListener( 'mousemove', onMouseMove, false );
        doomel.removeEventListener( 'mouseup', onMouseUp, false );
        scope.dispatchEvent( endEvent );
        state = STATE.NONE;

    }

    function onMouseWheel( event ) {

        if ( scope.enabled === false || scope.noZoom === true || state !== STATE.NONE ) return;

        //event.preventDefault();
        //event.stopPropagation();

        var delta = 0;

        if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9

            delta = event.wheelDelta;

        } else if ( event.detail !== undefined ) { // Firefox

            delta = - event.detail;

        }

        if ( delta > 0 ) {

            //scope.dollyOut();
            scope.object.fov = ( scope.object.fov < scope.maxFov )
                ? scope.object.fov + 1
                : scope.maxFov;
            scope.object.updateProjectionMatrix();

        } else if ( delta < 0 ) {

            //scope.dollyIn();
            scope.object.fov = ( scope.object.fov > scope.minFov )
                ? scope.object.fov - 1
                : scope.minFov;
            scope.object.updateProjectionMatrix();

        }

        scope.update();
        scope.dispatchEvent( changeEvent );
        scope.dispatchEvent( startEvent );
        scope.dispatchEvent( endEvent );

    }

    function onKeyUp ( event ) {

        switch ( event.keyCode ) {

            case scope.keys.UP:
                keyUp = false;
                break;

            case scope.keys.BOTTOM:
                keyBottom = false;
                break;

            case scope.keys.LEFT:
                keyLeft = false;
                break;

            case scope.keys.RIGHT:
                keyRight = false;
                break;

        }

    }

    function onKeyDown( event ) {

        if ( scope.enabled === false || scope.noKeys === true || scope.noRotate === true ) return;

        switch ( event.keyCode ) {

            case scope.keys.UP:
                keyUp = true;
                break;

            case scope.keys.BOTTOM:
                keyBottom = true;
                break;

            case scope.keys.LEFT:
                keyLeft = true;
                break;

            case scope.keys.RIGHT:
                keyRight = true;
                break;

        }

        if (keyUp || keyBottom || keyLeft || keyRight) {

            momentumOn = true;

            if (keyUp) momentumUp = - scope.rotateSpeed * scope.momentumKeydownFactor;
            if (keyBottom) momentumUp = scope.rotateSpeed * scope.momentumKeydownFactor;
            if (keyLeft) momentumLeft = - scope.rotateSpeed * scope.momentumKeydownFactor;
            if (keyRight) momentumLeft = scope.rotateSpeed * scope.momentumKeydownFactor;

        }

    }

    function touchstart( event ) {

        momentumOn = false;

        momentumLeft = momentumUp = 0;

        if ( scope.enabled === false ) return;

        switch ( event.touches.length ) {

            case 1:	// one-fingered touch: rotate

                if ( scope.noRotate === true ) return;

                state = STATE.TOUCH_ROTATE;

                rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;

            case 2:	// two-fingered touch: dolly

                if ( scope.noZoom === true ) return;

                state = STATE.TOUCH_DOLLY;

                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                var distance = Math.sqrt( dx * dx + dy * dy );

                break;

            case 3: // three-fingered touch: pan

                if ( scope.noPan === true ) return;

                state = STATE.TOUCH_PAN;

                panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;

            default:

                state = STATE.NONE;

        }

        if ( state !== STATE.NONE ) scope.dispatchEvent( startEvent );

    }

    function touchmove( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();
        event.stopPropagation();

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        switch ( event.touches.length ) {

            case 1: // one-fingered touch: rotate

                if ( scope.noRotate === true ) return;
                if ( state !== STATE.TOUCH_ROTATE ) return;

                rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                rotateDelta.subVectors( rotateEnd, rotateStart );

                // rotating across whole screen goes 360 degrees around
                scope.rotateLeft( 2 * Math.PI * rotateDelta.x /doomel.width * scope.rotateSpeed );
                // rotating up and down along whole screen attempts to go 360, but limited to 180
                scope.rotateUp( 2 * Math.PI * rotateDelta.y / doomel.height * scope.rotateSpeed );

                rotateStart.copy( rotateEnd );

                if( eventPrevious ){
                    momentumLeft = event.touches[ 0 ].pageX - eventPrevious.pageX;
                    momentumUp = event.touches[ 0 ].pageY - eventPrevious.pageY;
                }

                eventPrevious = {
                    pageX: event.touches[ 0 ].pageX,
                    pageY: event.touches[ 0 ].pageY,
                };

                scope.update();
                break;

            case 2: // two-fingered touch: dolly

                if ( scope.noZoom === true ) return;
                if ( state !== STATE.TOUCH_DOLLY ) return;

                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                var distance = Math.sqrt( dx * dx + dy * dy );

                if ( event.scale < 1 ) {

                    scope.object.fov = ( scope.object.fov < scope.maxFov )
                        ? scope.object.fov + 1
                        : scope.maxFov;
                    scope.object.updateProjectionMatrix();

                } else if ( event.scale > 1 ) {

                    scope.object.fov = ( scope.object.fov > scope.minFov )
                        ? scope.object.fov - 1
                        : scope.minFov;
                    scope.object.updateProjectionMatrix();

                }

                scope.update();
                scope.dispatchEvent( changeEvent );
                break;

            case 3: // three-fingered touch: pan

                if ( scope.noPan === true ) return;
                if ( state !== STATE.TOUCH_PAN ) return;

                panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                panDelta.subVectors( panEnd, panStart );

                scope.pan( panDelta.x, panDelta.y );

                panStart.copy( panEnd );

                scope.update();
                break;

            default:

                state = STATE.NONE;

        }

    }

    function touchend( /* event */ ) {

        momentumOn = true;

        eventPrevious = undefined;

        if ( scope.enabled === false ) return;

        scope.dispatchEvent( endEvent );
        state = STATE.NONE;

    }

    //this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
    this.domElement.addEventListener( 'mousedown', onMouseDown, false );
    //this.domElement.addEventListener( 'mousemove', onMouseMove, false );
    this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
    this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

    this.domElement.addEventListener( 'touchstart', touchstart, false );
    this.domElement.addEventListener( 'touchend', touchend, false );
    this.domElement.addEventListener( 'touchmove', touchmove, false );

    this.domElement.addEventListener( 'keyup', onKeyUp, false );
    this.domElement.addEventListener( 'keydown', onKeyDown, false );

    // force an update at start
    this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;;/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function( camera, domElement ) {

    var scope = this;
    var changeEvent = { type: 'change' };

    var rotY = 0;
    var rotX = 0;
    var tempX = 0;
    var tempY = 0;

    this.camera = camera;
    this.camera.rotation.reorder( "YXZ" );
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    this.enabled = true;

    this.deviceOrientation = {};
    this.screenOrientation = 0;

    this.alpha = 0;
    this.alphaOffsetAngle = 0;


    var onDeviceOrientationChangeEvent = function( event ) {

        scope.deviceOrientation = event;

    };

    var onScreenOrientationChangeEvent = function() {

        scope.screenOrientation = window.orientation || 0;

    };

    var onTouchStartEvent = function (event) {

        event.preventDefault();
        event.stopPropagation();

        tempX = event.touches[ 0 ].pageX;
        tempY = event.touches[ 0 ].pageY;

    };

    var onTouchMoveEvent = function (event) {

        event.preventDefault();
        event.stopPropagation();

        rotY += THREE.Math.degToRad( ( event.touches[ 0 ].pageX - tempX ) / 4 );
        rotX += THREE.Math.degToRad( ( tempY - event.touches[ 0 ].pageY ) / 4 );

        scope.updateAlphaOffsetAngle( rotY );

        tempX = event.touches[ 0 ].pageX;
        tempY = event.touches[ 0 ].pageY;

    };

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

    var setCameraQuaternion = function( quaternion, alpha, beta, gamma, orient ) {

        var zee = new THREE.Vector3( 0, 0, 1 );

        var euler = new THREE.Euler();

        var q0 = new THREE.Quaternion();

        var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

        var vectorFingerY;
        var fingerQY = new THREE.Quaternion();
        var fingerQX = new THREE.Quaternion();

        if ( scope.screenOrientation == 0 ) {

            vectorFingerY = new THREE.Vector3( 1, 0, 0 );
            fingerQY.setFromAxisAngle( vectorFingerY, -rotX );

        } else if ( scope.screenOrientation == 180 ) {

            vectorFingerY = new THREE.Vector3( 1, 0, 0 );
            fingerQY.setFromAxisAngle( vectorFingerY, rotX );

        } else if ( scope.screenOrientation == 90 ) {

            vectorFingerY = new THREE.Vector3( 0, 1, 0 );
            fingerQY.setFromAxisAngle( vectorFingerY, rotX );

        } else if ( scope.screenOrientation == - 90) {

            vectorFingerY = new THREE.Vector3( 0, 1, 0 );
            fingerQY.setFromAxisAngle( vectorFingerY, -rotX );

        }

        q1.multiply( fingerQY );
        q1.multiply( fingerQX );

        euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

        quaternion.setFromEuler( euler ); // orient the device

        quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

        quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation

    };

    this.connect = function() {

        onScreenOrientationChangeEvent(); // run once on load

        window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
        window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );
        window.addEventListener( 'deviceorientation', this.update.bind( this ), false );

        scope.domElement.addEventListener( "touchstart", onTouchStartEvent, false );
        scope.domElement.addEventListener( "touchmove", onTouchMoveEvent, false );

        scope.enabled = true;

    };

    this.disconnect = function() {

        window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
        window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );
        window.removeEventListener( 'deviceorientation', this.update.bind( this ), false );

        scope.domElement.removeEventListener( "touchstart", onTouchStartEvent, false );
        scope.domElement.removeEventListener( "touchmove", onTouchMoveEvent, false );

        scope.enabled = false;

    };

    this.update = function( ignoreUpdate ) {

        if ( scope.enabled === false ) return;

        var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) + this.alphaOffsetAngle : 0; // Z
        var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad( scope.deviceOrientation.beta ) : 0; // X'
        var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
        var orient = scope.screenOrientation ? THREE.Math.degToRad( scope.screenOrientation ) : 0; // O

        setCameraQuaternion( scope.camera.quaternion, alpha, beta, gamma, orient );
        this.alpha = alpha;

        ignoreUpdate !== true && this.dispatchEvent( changeEvent );

    };

    this.updateAlphaOffsetAngle = function( angle ) {

        this.alphaOffsetAngle = angle;
        this.update();

    };

    this.dispose = function() {

        this.disconnect();

    };

    this.connect();

};

THREE.DeviceOrientationControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.DeviceOrientationControls.prototype.constructor = THREE.DeviceOrientationControls;; /** The Bend modifier lets you bend the current selection up to 90 degrees about a single axis,
 * producing a uniform bend in an object's geometry.
 * You can control the angle and direction of the bend on any of three axes.
 * The geometry has to have rather large number of polygons!
 * options:
 * 	 direction - deformation direction (in local coordinates!).
 * 	 axis - deformation axis (in local coordinates!). Vector of direction and axis are perpendicular.
 * 	 angle - deformation angle.
 * @author Vildanov Almaz / alvild@gmail.com
 * The algorithm of a bend is based on the chain line cosh: y = 1/b * cosh(b*x) - 1/b. It can be used only in three.js.
 */

THREE.BendModifier = function () {

};

THREE.BendModifier.prototype = {

    constructor: THREE.BendModifier,

    set: function ( direction, axis, angle ) {
        this.direction = new THREE.Vector3(); this.direction.copy( direction );
        this.axis = new THREE.Vector3(); this.axis.copy( axis );
        this.angle = angle;
        return this
    },

    _sign: function (a) {
        return 0 > a ? -1 : 0 < a ? 1 : 0
    },

    _cosh: function( x )  {
        return ( Math.exp( x ) + Math.exp( -x ) ) / 2;
    },

    _sinhInverse: function( x )  {
            return  Math.log( Math.abs( x ) + Math.sqrt( x * x + 1 ) );
    },

    modify: function ( geometry ) {

        var thirdAxis = new THREE.Vector3();  thirdAxis.crossVectors( this.direction, this.axis );

        // P - matrices of the change-of-coordinates
        var P = new THREE.Matrix4();
        P.set ( thirdAxis.x, thirdAxis.y, thirdAxis.z, 0,
            this.direction.x, this.direction.y, this.direction.z, 0,
            this.axis.x, this.axis.y, this.axis.z, 0,
            0, 0, 0, 1 ).transpose();

        var InverseP =  new THREE.Matrix4().getInverse( P );
        var newVertices = []; var oldVertices = []; var anglesBetweenOldandNewVertices = [];

        var meshGeometryBoundingBoxMaxx = 0; var meshGeometryBoundingBoxMinx = 0;
        var meshGeometryBoundingBoxMaxy = 0; var meshGeometryBoundingBoxMiny = 0;

        for (var i = 0; i < geometry.vertices.length; i++)  {

            newVertices[i] = new THREE.Vector3(); newVertices[i].copy( geometry.vertices[i] ).applyMatrix4( InverseP );
            if ( newVertices[i].x > meshGeometryBoundingBoxMaxx ) { meshGeometryBoundingBoxMaxx = newVertices[i].x; }
            if ( newVertices[i].x < meshGeometryBoundingBoxMinx ) { meshGeometryBoundingBoxMinx = newVertices[i].x; }
            if ( newVertices[i].y > meshGeometryBoundingBoxMaxy ) { meshGeometryBoundingBoxMaxy = newVertices[i].y; }
            if ( newVertices[i].y < meshGeometryBoundingBoxMiny ) { meshGeometryBoundingBoxMiny = newVertices[i].y; }

        }

        var meshWidthold =  meshGeometryBoundingBoxMaxx - meshGeometryBoundingBoxMinx;
        var meshDepth =  meshGeometryBoundingBoxMaxy - meshGeometryBoundingBoxMiny;
        var ParamB = 2 * this._sinhInverse( Math.tan( this.angle ) ) / meshWidthold;
        var oldMiddlex = (meshGeometryBoundingBoxMaxx + meshGeometryBoundingBoxMinx) / 2;
        var oldMiddley = (meshGeometryBoundingBoxMaxy + meshGeometryBoundingBoxMiny) / 2;

        for (var i = 0; i < geometry.vertices.length; i++ )  {

            oldVertices[i] = new THREE.Vector3(); oldVertices[i].copy( newVertices[i] );
            newVertices[i].x = this._sign( newVertices[i].x - oldMiddlex ) * 1 / ParamB * this._sinhInverse( ( newVertices[i].x - oldMiddlex ) * ParamB );

        }

        var meshWidth = 2 / ParamB * this._sinhInverse( meshWidthold / 2 * ParamB );

        var NewParamB = 2 * this._sinhInverse( Math.tan( this.angle ) ) / meshWidth;

        var rightEdgePos = new THREE.Vector3( meshWidth / 2, -meshDepth / 2, 0 );
        rightEdgePos.y = 1 / NewParamB * this._cosh( NewParamB * rightEdgePos.x ) - 1 / NewParamB - meshDepth / 2;

        var bendCenter = new THREE.Vector3( 0, rightEdgePos.y  + rightEdgePos.x / Math.tan( this.angle ), 0 );

        for ( var i = 0; i < geometry.vertices.length; i++ )  {

            var x0 = this._sign( oldVertices[i].x - oldMiddlex ) * 1 / ParamB * this._sinhInverse( ( oldVertices[i].x - oldMiddlex ) * ParamB );
            var y0 = 1 / NewParamB * this._cosh( NewParamB * x0 ) - 1 / NewParamB;

            var k = new THREE.Vector3( bendCenter.x - x0, bendCenter.y - ( y0 - meshDepth / 2 ), bendCenter.z ).normalize();

            var Q = new THREE.Vector3();
            Q.addVectors( new THREE.Vector3( x0, y0 - meshDepth / 2, oldVertices[i].z ), k.multiplyScalar( oldVertices[i].y + meshDepth / 2 ) );
            newVertices[i].x = Q.x;  newVertices[i].y = Q.y;

        }

        var middle = oldMiddlex * meshWidth / meshWidthold;

        for ( var i = 0; i < geometry.vertices.length; i++ )  {

            var O = new THREE.Vector3( oldMiddlex, oldMiddley, oldVertices[i].z );
            var p = new THREE.Vector3(); p.subVectors( oldVertices[i], O );
            var q = new THREE.Vector3(); q.subVectors( newVertices[i], O );

            anglesBetweenOldandNewVertices[i] = Math.acos( 1 / this._cosh( ParamB * newVertices[i].x ) )  * this._sign( newVertices[i].x );

            newVertices[i].x = newVertices[i].x + middle;
            geometry.vertices[i].copy( newVertices[i].applyMatrix4( P ) );

        }

        geometry.computeFaceNormals();
        geometry.verticesNeedUpdate = true;
        geometry.normalsNeedUpdate = true;

        // compute Vertex Normals
        var fvNames = [ 'a', 'b', 'c', 'd' ];

        for ( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

            var face = geometry.faces[ f ];
            if ( face.vertexNormals === undefined ) {
                continue;
            }
            for ( var v = 0, vl = face.vertexNormals.length; v < vl; v ++ ) {

                var angle = anglesBetweenOldandNewVertices[ face[ fvNames[ v ] ] ];
                var x = this.axis.x,
                    y = this.axis.y,
                    z = this.axis.z;

                var rotateMatrix = new THREE.Matrix3();
                rotateMatrix.set ( Math.cos(angle) + (1-Math.cos(angle))*x*x, (1-Math.cos(angle))*x*y - Math.sin(angle)*z, (1-Math.cos(angle))*x*z + Math.sin(angle)*y,
                                (1-Math.cos(angle))*y*x + Math.sin(angle)*z, Math.cos(angle) + (1-Math.cos(angle))*y*y, (1-Math.cos(angle))*y*z - Math.sin(angle)*x,
                                (1-Math.cos(angle))*z*x - Math.sin(angle)*y, (1-Math.cos(angle))*z*y + Math.sin(angle)*x, Math.cos(angle) + (1-Math.cos(angle))*z*z );

                face.vertexNormals[ v ].applyMatrix3( rotateMatrix );

                }

            }
        // end compute Vertex Normals

        return this
    }
};/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CardboardEffect = function ( renderer ) {

    var _camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

    var _scene = new THREE.Scene();

    var _stereo = new THREE.StereoCamera();
    _stereo.aspect = 0.5;

    var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

    var _renderTarget = new THREE.WebGLRenderTarget( 512, 512, _params );
    _renderTarget.scissorTest = true;
    _renderTarget.texture.generateMipmaps = false;

    // Distortion Mesh ported from:
    // https://github.com/borismus/webvr-boilerplate/blob/master/src/distortion/barrel-distortion-fragment.js

    var distortion = new THREE.Vector2( 0.441, 0.156 );

    var geometry = new THREE.PlaneBufferGeometry( 1, 1, 10, 20 ).removeAttribute( 'normal' ).toNonIndexed();

    var positions = geometry.attributes.position.array;
    var uvs = geometry.attributes.uv.array;

    // duplicate
    geometry.attributes.position.count *= 2;
    geometry.attributes.uv.count *= 2;

    var positions2 = new Float32Array( positions.length * 2 );
    positions2.set( positions );
    positions2.set( positions, positions.length );

    var uvs2 = new Float32Array( uvs.length * 2 );
    uvs2.set( uvs );
    uvs2.set( uvs, uvs.length );

    var vector = new THREE.Vector2();
    var length = positions.length / 3;

    for ( var i = 0, l = positions2.length / 3; i < l; i ++ ) {

        vector.x = positions2[ i * 3 + 0 ];
        vector.y = positions2[ i * 3 + 1 ];

        var dot = vector.dot( vector );
        var scalar = 1.5 + ( distortion.x + distortion.y * dot ) * dot;

        var offset = i < length ? 0 : 1;

        positions2[ i * 3 + 0 ] = ( vector.x / scalar ) * 1.5 - 0.5 + offset;
        positions2[ i * 3 + 1 ] = ( vector.y / scalar ) * 3.0;

        uvs2[ i * 2 ] = ( uvs2[ i * 2 ] + offset ) * 0.5;

    }

    geometry.attributes.position.array = positions2;
    geometry.attributes.uv.array = uvs2;

    //

    // var material = new THREE.MeshBasicMaterial( { wireframe: true } );
    var material = new THREE.MeshBasicMaterial( { map: _renderTarget.texture } );
    var mesh = new THREE.Mesh( geometry, material );
    _scene.add( mesh );

    //

    this.setSize = function ( width, height ) {

        renderer.setSize( width, height );

        var pixelRatio = renderer.getPixelRatio();

        _renderTarget.setSize( width * pixelRatio, height * pixelRatio );

    };

    this.render = function ( scene, camera ) {

        scene.updateMatrixWorld();

        if ( camera.parent === null ) camera.updateMatrixWorld();

        _stereo.update( camera );

        var width = _renderTarget.width / 2;
        var height = _renderTarget.height;

        _renderTarget.scissor.set( 0, 0, width, height );
        _renderTarget.viewport.set( 0, 0, width, height );
        renderer.render( scene, _stereo.cameraL, _renderTarget );

        _renderTarget.scissor.set( width, 0, width, height );
        _renderTarget.viewport.set( width, 0, width, height );
        renderer.render( scene, _stereo.cameraR, _renderTarget );

        renderer.render( _scene, _camera );

    };

};;/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 * @authod arodic / http://aleksandarrodic.com/
 * @authod fonserbc / http://fonserbc.github.io/
*/

THREE.StereoEffect = function ( renderer ) {

    var _stereo = new THREE.StereoCamera();
    _stereo.aspect = 0.5;

    this.setEyeSeparation = function ( eyeSep ) {

        _stereo.eyeSep = eyeSep;

    };

    this.setSize = function ( width, height ) {

        renderer.setSize( width, height );

    };

    this.render = function ( scene, camera ) {

        scene.updateMatrixWorld();

        if ( camera.parent === null ) camera.updateMatrixWorld();

        _stereo.update( camera );

        var size = renderer.getSize();

        if ( renderer.autoClear ) renderer.clear();
        renderer.setScissorTest( true );

        renderer.setScissor( 0, 0, size.width / 2, size.height );
        renderer.setViewport( 0, 0, size.width / 2, size.height );
        renderer.render( scene, _stereo.cameraL );

        renderer.setScissor( size.width / 2, 0, size.width / 2, size.height );
        renderer.setViewport( size.width / 2, 0, size.width / 2, size.height );
        renderer.render( scene, _stereo.cameraR );

        renderer.setScissorTest( false );

    };

};
