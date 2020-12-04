Physijs.scripts.worker = '/libs/physijs_worker.js';
Physijs.scripts.ammo = '/libs/ammo.js';

let initScene,
    render,
    ground_material,
    border_material,
    car_material,
    ball_material,
    wheel_material,
    wheel_geometry,
    wheel_pos_y,
    renderer,
    render_stats,
    physics_stats,
    scene,
    ground = {},
    light,
    camera,
    ball,
    car = {},
    createCar,
    createBall,
    checkCarPosition,
    checkBallPosition;

initScene = () => {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor('#e5e5e5');
    document.body.appendChild(renderer.domElement);

    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -30, 0));
    scene.addEventListener('update', function () {
        scene.simulate(undefined, 2);
        checkCarPosition();
        checkBallPosition();
    });

    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set(80, 80, 280);
    camera.lookAt(scene.position);
    scene.add(camera);

    // ORBIT CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minPolarAngle = Math.PI * 0.3;
    controls.maxPolarAngle = Math.PI * 0.4;
    controls.target.set(0, 40, 0);
    controls.enableZoom = false;

    // LIGHTS
    var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    light.position.set(50, 100, 10);
    light.sh;
    scene.add(light);

    // ==============================================================================
    // GROUND
    loader = new THREE.TextureLoader();
    var ground_texture = loader.load('/images/rocks.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(3, 3);
    });
    ground_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ map: ground_texture }),
        0.9,
        0.4
    );

    ground.plane = new Physijs.BoxMesh(
        new THREE.BoxGeometry(100, 1, 100),
        ground_material,
        0 // mass
        // { restitution: 0.2, friction: 0.9 }
    );
    ground.plane.receiveShadow = true;
    scene.add(ground.plane);

    // ------------------------------------------------------------------------------
    // GROUND - BORDERS
    var border_texture = loader.load('/images/wood.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(5, 5);
    });
    border_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
            map: border_texture,
        }),
        0.1,
        0.9
    );

    border_material.map.wrapS = border_material.map.wrapT =
        THREE.RepeatWrapping;
    border_material.map.repeat.set(0.5, 0.5);

    let border_height = 10;

    // ------------------------------------
    // GROUND - BORDERS - EAST
    ground.east_border = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, border_height, 100),
        ground_material,
        0, // mass
        { restitution: 0.9, friction: 0.1 }
    );
    ground.east_border.position.set(49, border_height / 2 + 0.5, 0);
    scene.add(ground.east_border);

    // ------------------------------------
    // GROUND - BORDERS - WEST
    ground.west_border = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, border_height, 100),
        ground_material,
        0, // mass
        { restitution: 0.9, friction: 0.1 }
    );
    ground.west_border.position.set(-49, border_height / 2 + 0.5, 0);
    scene.add(ground.west_border);

    // ------------------------------------
    // GROUND - BORDERS - NORTH
    ground.north_border_1 = new Physijs.BoxMesh(
        new THREE.BoxGeometry(35, border_height, 2),
        ground_material,
        0, // mass
        { restitution: 0.9, friction: 0.1 }
    );
    ground.north_border_1.position.set(-30.5, border_height / 2 + 0.5, -49);
    scene.add(ground.north_border_1);

    ground.north_border_2 = new Physijs.BoxMesh(
        new THREE.BoxGeometry(35, border_height, 2),
        ground_material,
        0, // mass
        { restitution: 0.9, friction: 0.1 }
    );
    ground.north_border_2.position.set(30.5, border_height / 2 + 0.5, -49);
    scene.add(ground.north_border_2);

    // ------------------------------------
    // GROUND - BORDERS - SOUTH
    ground.south_border_1 = new Physijs.BoxMesh(
        new THREE.BoxGeometry(35, border_height, 2),
        ground_material,
        0, // mass
        { restitution: 0.9, friction: 0.1 }
    );
    ground.south_border_1.position.set(-30.5, border_height / 2 + 0.5, 49);
    scene.add(ground.south_border_1);

    ground.south_border_2 = new Physijs.BoxMesh(
        new THREE.BoxGeometry(35, border_height, 2),
        ground_material,
        0, // mass
        { restitution: 0.9, friction: 0.1 }
    );
    ground.south_border_2.position.set(30.5, border_height / 2 + 0.5, 49);
    scene.add(ground.south_border_2);

    // ==============================================================================
    // CAR
    createCar = () => {
        car_material = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ color: 0x5ab7cc }),
            0.8,
            0.2
        );

        wheel_material = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ color: 0x444444 }),
            0.9,
            0.6
        );
        wheel_geometry = new THREE.CylinderGeometry(2, 2, 1, 20);
        wheel_pos_fx = 20.5;
        wheel_pos_bx = 29.5;
        wheel_pos_y = 2.5;
        wheel_pos_z = 5;

        // ------------------------------------------------------------------------------
        // CAR BODY
        car.body = new Physijs.BoxMesh(
            new THREE.BoxGeometry(15, 4, 7),
            car_material,
            3000
        );
        car.body.position.set(25, 5, 0);
        car.body.receiveShadow = car.body.castShadow = true;

        // ------------------------------------------------------------------------------
        // CAR TOP
        car.top_central = new Physijs.BoxMesh(
            new THREE.BoxGeometry(5, 3, 7),
            car_material,
            500
        );
        car.top_central.position.x = 1.5;
        car.top_central.position.y = 3.5;
        car.body.add(car.top_central);

        car.top_front = new Physijs.CylinderMesh(
            new THREE.CylinderGeometry(
                3,
                3,
                7,
                10,
                10,
                false,
                Math.PI,
                Math.PI / 2
            ),
            car_material,
            100
        );
        car.top_front.position.x = -1;
        car.top_front.position.y = 2;
        car.top_front.rotation.x = Math.PI / 2;
        car.body.add(car.top_front);

        // ------------------------------------------------------------------------------
        // CAR BODY FRONT
        car.body_front = new Physijs.CylinderMesh(
            new THREE.CylinderGeometry(
                2,
                2,
                7,
                10,
                10,
                false,
                Math.PI,
                Math.PI
            ),
            car_material,
            200 // mass
            // { restitution: 0.9, friction: 0.1 }
        );
        car.body_front.position.x = -7.5;
        car.body_front.rotation.x = Math.PI / 2;
        car.body.add(car.body_front);
        scene.add(car.body);

        // ------------------------------------------------------------------------------
        // WHEEL FRONT LEFT
        car.wheel_fl = new Physijs.CylinderMesh(
            wheel_geometry,
            wheel_material,
            500, // mass
            { restitution: 0, friction: 1 }
        );
        car.wheel_fl.rotation.x = Math.PI / 2;
        car.wheel_fl.position.set(wheel_pos_fx, wheel_pos_y, wheel_pos_z);
        car.wheel_fl.receiveShadow = car.wheel_fl.castShadow = true;
        scene.add(car.wheel_fl);
        car.wheel_fl_constraint = new Physijs.DOFConstraint(
            car.wheel_fl,
            car.body,
            new THREE.Vector3(wheel_pos_fx, wheel_pos_y, wheel_pos_z)
        );
        scene.addConstraint(car.wheel_fl_constraint);
        car.wheel_fl_constraint.setAngularLowerLimit({
            x: 0,
            y: -Math.PI / 8,
            z: 1,
        });
        car.wheel_fl_constraint.setAngularUpperLimit({
            x: 0,
            y: Math.PI / 8,
            z: 0,
        });

        // ------------------------------------------------------------------------------
        // WHEEL FRONT RIGHT
        car.wheel_fr = new Physijs.CylinderMesh(
            wheel_geometry,
            wheel_material,
            500, // mass
            { restitution: 0, friction: 1 }
        );
        car.wheel_fr.rotation.x = Math.PI / 2;
        car.wheel_fr.position.set(wheel_pos_fx, wheel_pos_y, -wheel_pos_z);
        car.wheel_fr.receiveShadow = car.wheel_fr.castShadow = true;
        scene.add(car.wheel_fr);
        car.wheel_fr_constraint = new Physijs.DOFConstraint(
            car.wheel_fr,
            car.body,
            new THREE.Vector3(wheel_pos_fx, wheel_pos_y, -wheel_pos_z)
        );
        scene.addConstraint(car.wheel_fr_constraint);
        car.wheel_fr_constraint.setAngularLowerLimit({
            x: 0,
            y: -Math.PI / 8,
            z: 1,
        });
        car.wheel_fr_constraint.setAngularUpperLimit({
            x: 0,
            y: Math.PI / 8,
            z: 0,
        });

        // ------------------------------------------------------------------------------
        // WHEEL BACK LEFT
        car.wheel_bl = new Physijs.CylinderMesh(
            wheel_geometry,
            wheel_material,
            500, // mass
            { restitution: 0, friction: 1 }
        );
        car.wheel_bl.rotation.x = Math.PI / 2;
        car.wheel_bl.position.set(wheel_pos_bx, wheel_pos_y, wheel_pos_z);
        car.wheel_bl.receiveShadow = car.wheel_bl.castShadow = true;
        scene.add(car.wheel_bl);
        car.wheel_bl_constraint = new Physijs.DOFConstraint(
            car.wheel_bl,
            car.body,
            new THREE.Vector3(wheel_pos_bx, wheel_pos_y, wheel_pos_z)
        );
        scene.addConstraint(car.wheel_bl_constraint);
        car.wheel_bl_constraint.setAngularLowerLimit({
            x: 0,
            y: 0,
            z: 0,
        });
        car.wheel_bl_constraint.setAngularUpperLimit({
            x: 0,
            y: 0,
            z: 1,
        });

        // ------------------------------------------------------------------------------
        // WHEEL BACK RIGHT
        car.wheel_br = new Physijs.CylinderMesh(
            wheel_geometry,
            wheel_material,
            500, // mass
            { restitution: 0, friction: 1 }
        );
        car.wheel_br.rotation.x = Math.PI / 2;
        car.wheel_br.position.set(wheel_pos_bx, wheel_pos_y, -wheel_pos_z);
        car.wheel_br.receiveShadow = car.wheel_br.castShadow = true;
        scene.add(car.wheel_br);
        car.wheel_br_constraint = new Physijs.DOFConstraint(
            car.wheel_br,
            car.body,
            new THREE.Vector3(wheel_pos_bx, wheel_pos_y, -wheel_pos_z)
        );
        scene.addConstraint(car.wheel_br_constraint);
        car.wheel_br_constraint.setAngularLowerLimit({
            x: 0,
            y: 0,
            z: 0,
        });
        car.wheel_br_constraint.setAngularUpperLimit({
            x: 0,
            y: 0,
            z: 1,
        });
    };
    createCar();

    // ==============================================================================
    // MOVEMENT
    document.addEventListener('keydown', function (ev) {
        console.log(ev.keyCode);
        switch (ev.keyCode) {
            case 65:
                // ------------------------------------------------------------------
                // Left
                car.wheel_fl_constraint.configureAngularMotor(
                    1,
                    -Math.PI / 4,
                    Math.PI / 4,
                    1,
                    200
                );
                car.wheel_fr_constraint.configureAngularMotor(
                    1,
                    -Math.PI / 4,
                    Math.PI / 4,
                    1,
                    200
                );
                car.wheel_fl_constraint.enableAngularMotor(1);
                car.wheel_fr_constraint.enableAngularMotor(1);
                break;

            case 68:
                // ------------------------------------------------------------------
                // Right
                car.wheel_fl_constraint.configureAngularMotor(
                    1,
                    -Math.PI / 4,
                    Math.PI / 4,
                    -1,
                    200
                );
                car.wheel_fr_constraint.configureAngularMotor(
                    1,
                    -Math.PI / 4,
                    Math.PI / 4,
                    -1,
                    200
                );
                car.wheel_fl_constraint.enableAngularMotor(1);
                car.wheel_fr_constraint.enableAngularMotor(1);
                break;

            case 87:
                // ------------------------------------------------------------------
                // Up
                car.wheel_bl_constraint.configureAngularMotor(
                    2,
                    1,
                    0,
                    15,
                    3000
                );
                car.wheel_br_constraint.configureAngularMotor(
                    2,
                    1,
                    0,
                    15,
                    3000
                );
                car.wheel_bl_constraint.enableAngularMotor(2);
                car.wheel_br_constraint.enableAngularMotor(2);
                break;

            case 83:
                // ------------------------------------------------------------------
                // Down
                car.wheel_bl_constraint.configureAngularMotor(
                    2,
                    1,
                    0,
                    -10,
                    12000
                );
                car.wheel_br_constraint.configureAngularMotor(
                    2,
                    1,
                    0,
                    -10,
                    12000
                );
                car.wheel_bl_constraint.enableAngularMotor(2);
                car.wheel_br_constraint.enableAngularMotor(2);
                break;
        }
    });

    document.addEventListener('keyup', function (ev) {
        switch (ev.keyCode) {
            case 65:
                // Left
                car.wheel_fl_constraint.disableAngularMotor(1);
                car.wheel_fr_constraint.disableAngularMotor(1);
                break;

            case 68:
                // Right
                car.wheel_fl_constraint.disableAngularMotor(1);
                car.wheel_fr_constraint.disableAngularMotor(1);
                break;

            case 87:
                // Up
                car.wheel_bl_constraint.disableAngularMotor(2);
                car.wheel_br_constraint.disableAngularMotor(2);
                break;

            case 83:
                // Down
                car.wheel_bl_constraint.disableAngularMotor(2);
                car.wheel_br_constraint.disableAngularMotor(2);
                break;
        }
    });

    // ==============================================================================
    // BALL
    createBall = () => {
        ball_material = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ color: 0xffffff }),
            0.1,
            1
        );
        ball = new Physijs.SphereMesh(
            new THREE.SphereGeometry(5, 20, 20),
            ball_material,
            20, // mass
            { restitution: 0.9, friction: 0.9 }
        );
        ball.position.x = -10;
        ball.position.y = 25;
        scene.add(ball);
    };
    createBall();

    // ==============================================================================
    // CHECK OBJECTS POSITIONS
    checkCarPosition = () => {
        if (car.body.position.y < 0) {
            createCar();
            let readDisclaimer = document.querySelector('.read-disclaimer');
            readDisclaimer.innerHTML = 'Did you read the disclaimer?';
            setTimeout(function () {
                readDisclaimer.innerHTML = '';
            }, 2000);
        }
    };
    checkBallPosition = () => {
        if (ball.position.y < 0) {
            createBall();
        }
    };

    // handleCollision = function (
    //     collided_with,
    //     linearVelocity,
    //     angularVelocity
    // ) {
    //     ball.color = '0xff0000';
    // };

    requestAnimationFrame(render);
    scene.simulate();
};

render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
};

window.onload = initScene;
