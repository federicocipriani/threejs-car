Physijs.scripts.worker = './physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';

var initScene,
    render,
    ground_material,
    border_material,
    car_material,
    ball_material,
    wheel_material,
    wheel_geometry,
    wheel_pos_x,
    wheel_pos_y,
    renderer,
    render_stats,
    physics_stats,
    scene,
    ground_geometry,
    ground = {},
    light,
    camera,
    ball,
    car = {};

initScene = function () {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    document.body.appendChild(renderer.domElement);

    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -30, 0));
    scene.addEventListener('update', function () {
        scene.simulate(undefined, 2);
    });

    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set(60, 60, 100);
    // camera.position.set(0, 5, 60);
    camera.lookAt(scene.position);
    scene.add(camera);

    // Orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Light
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(20, 40, -15);
    light.position.set(0, 10, 15);
    light.target.position.copy(scene.position);
    light.castShadow = true;
    light.shadowCameraLeft = -60;
    light.shadowCameraTop = -60;
    light.shadowCameraRight = 60;
    light.shadowCameraBottom = 60;
    light.shadowCameraNear = 20;
    light.shadowCameraFar = 200;
    light.shadowBias = -0.0001;
    light.shadowMapWidth = light.shadowMapHeight = 2048;
    light.shadowDarkness = 0.7;
    scene.add(light);

    // ==============================================================================
    // GROUND
    ground_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        0.9, // high friction
        0.9 // low restitution
    );

    ground.plane = new Physijs.BoxMesh(
        new THREE.BoxGeometry(100, 1, 100),
        ground_material,
        0 // mass
    );
    ground.plane.receiveShadow = true;
    scene.add(ground.plane);

    // ------------------------------------------------------------------------------
    // GROUND - BORDERS
    border_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        0.1,
        0.9
    );

    let border_height = 5;
    ground.east_border = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, border_height, 100),
        ground_material,
        0 // mass
    );
    ground.east_border.position.set(49, 3, 0);
    scene.add(ground.east_border);

    ground.west_border = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, border_height, 100),
        ground_material,
        0 // mass
    );
    ground.west_border.position.set(-49, 3, 0);
    // ground.west_border.rotation.z = -Math.PI / 2;
    scene.add(ground.west_border);

    ground.north_border = new Physijs.BoxMesh(
        new THREE.BoxGeometry(96, border_height, 2),
        ground_material,
        0 // mass
    );
    ground.north_border.position.set(0, 3, -49);
    scene.add(ground.north_border);

    ground.south_border = new Physijs.BoxMesh(
        new THREE.BoxGeometry(96, border_height, 2),
        ground_material,
        0 // mass
    );
    ground.south_border.position.set(0, 3, 49);
    scene.add(ground.south_border);

    // ==============================================================================
    // BALL
    ball_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
        0.1,
        1
    );
    ball = new Physijs.SphereMesh(
        new THREE.SphereGeometry(5, 20, 20),
        ball_material
    );
    ball.position.x = -10;
    ball.position.y = 5.5;
    scene.add(ball);

    // ==============================================================================
    // CAR
    car_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xff6666 }),
        0.9, // low friction
        1 // low restitution
    );

    wheel_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0x444444 }),
        1, // high friction
        0 // medium restitution
    );
    wheel_geometry = new THREE.CylinderGeometry(2, 2, 1, 8);
    wheel_pos_fx = 20.5;
    wheel_pos_bx = 29.5;
    wheel_pos_y = 2.5;

    // ------------------------------------------------------------------------------
    // CAR BODY
    car.body = new Physijs.BoxMesh(
        new THREE.BoxGeometry(15, 4, 7),
        car_material
    );
    // car.body.position.y = 5;
    car.body.position.set(25, 5, 0);
    car.body.receiveShadow = car.body.castShadow = true;

    // ------------------------------------------------------------------------------
    // CAR TOP
    car.top_central = new Physijs.BoxMesh(
        new THREE.BoxGeometry(5, 3, 7),
        car_material
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
        car_material
    );
    car.top_front.position.x = -1;
    car.top_front.position.y = 2;
    car.top_front.rotation.x = Math.PI / 2;
    car.body.add(car.top_front);

    // ------------------------------------------------------------------------------
    // CAR BODY FRONT
    car.body_front = new Physijs.CylinderMesh(
        new THREE.CylinderGeometry(2, 2, 7, 10, 10, false, Math.PI, Math.PI),
        car_material
    );
    car.body_front.position.x = -7.5;
    car.body_front.rotation.x = Math.PI / 2;
    car.body.add(car.body_front);
    scene.add(car.body);

    // ------------------------------------------------------------------------------
    // WHEEL FRONT LEFT
    car.wheel_fl = new Physijs.CylinderMesh(wheel_geometry, wheel_material);
    car.wheel_fl.rotation.x = Math.PI / 2;
    car.wheel_fl.position.set(wheel_pos_fx, wheel_pos_y, 5);
    car.wheel_fl.receiveShadow = car.wheel_fl.castShadow = true;
    scene.add(car.wheel_fl);
    car.wheel_fl_constraint = new Physijs.DOFConstraint(
        car.wheel_fl,
        car.body,
        new THREE.Vector3(wheel_pos_fx, wheel_pos_y, 5)
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
    car.wheel_fr = new Physijs.CylinderMesh(wheel_geometry, wheel_material);
    car.wheel_fr.rotation.x = Math.PI / 2;
    car.wheel_fr.position.set(wheel_pos_fx, wheel_pos_y, -5);
    car.wheel_fr.receiveShadow = car.wheel_fr.castShadow = true;
    scene.add(car.wheel_fr);
    car.wheel_fr_constraint = new Physijs.DOFConstraint(
        car.wheel_fr,
        car.body,
        new THREE.Vector3(wheel_pos_fx, wheel_pos_y, -5)
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
    car.wheel_bl = new Physijs.CylinderMesh(wheel_geometry, wheel_material);
    car.wheel_bl.rotation.x = Math.PI / 2;
    car.wheel_bl.position.set(wheel_pos_bx, wheel_pos_y, 5);
    car.wheel_bl.receiveShadow = car.wheel_bl.castShadow = true;
    scene.add(car.wheel_bl);
    car.wheel_bl_constraint = new Physijs.DOFConstraint(
        car.wheel_bl,
        car.body,
        new THREE.Vector3(wheel_pos_bx, wheel_pos_y, 5)
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
    car.wheel_br = new Physijs.CylinderMesh(wheel_geometry, wheel_material);
    car.wheel_br.rotation.x = Math.PI / 2;
    car.wheel_br.position.set(wheel_pos_bx, wheel_pos_y, -5);
    car.wheel_br.receiveShadow = car.wheel_br.castShadow = true;
    scene.add(car.wheel_br);
    car.wheel_br_constraint = new Physijs.DOFConstraint(
        car.wheel_br,
        car.body,
        new THREE.Vector3(wheel_pos_bx, wheel_pos_y, -5)
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
                    -Math.PI / 2,
                    Math.PI / 2,
                    2,
                    200
                );
                car.wheel_fr_constraint.configureAngularMotor(
                    1,
                    -Math.PI / 2,
                    Math.PI / 2,
                    2,
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
                    -Math.PI / 2,
                    Math.PI / 2,
                    -2,
                    200
                );
                car.wheel_fr_constraint.configureAngularMotor(
                    1,
                    -Math.PI / 2,
                    Math.PI / 2,
                    -2,
                    200
                );
                car.wheel_fl_constraint.enableAngularMotor(1);
                car.wheel_fr_constraint.enableAngularMotor(1);
                break;

            case 87:
                // ------------------------------------------------------------------
                // Up
                car.wheel_bl_constraint.configureAngularMotor(2, 1, 0, 75, 500);
                car.wheel_br_constraint.configureAngularMotor(2, 1, 0, 75, 500);
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
                    -75,
                    500
                );
                car.wheel_br_constraint.configureAngularMotor(
                    2,
                    1,
                    0,
                    -75,
                    500
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

    requestAnimationFrame(render);
    scene.simulate();
};

render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
};

window.onload = initScene;
