import Manager from "@/core/Manager";
import React, { useEffect, useRef } from "react";
import {
    BoxGeometry,
    BufferGeometry,
    CylinderGeometry,
    DirectionalLight,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshPhongMaterial,
    Object3D,
    PerspectiveCamera,
    PlaneGeometry,
    Scene,
    SphereGeometry,
    SplineCurve,
    Vector2,
    Vector3,
} from "three";
import "./index.css";

const Tank: React.FC = () => {
    const ref = useRef<HTMLCanvasElement>();

    useEffect(() => {
        render();
    }, []);

    const render = () => {
        if (ref.current == undefined) {
            return;
        }

        const manager = new Manager({ canvas: ref.current });
        manager.getRenderer().setClearColor(0xaaaaaa);
        manager.getRenderer().shadowMap.enabled = true;

        const camera = new PerspectiveCamera(40, 2, 0.1, 1000);
        camera.position.set(8, 4, 10).multiplyScalar(3);
        camera.lookAt(0, 0, 0);

        manager.addScene(new Scene());

        const light = new DirectionalLight(0xffffff, 1);
        light.position.set(0, 20, 0);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        const d = 50;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 50;
        light.shadow.bias = 0.001;

        manager.getScene().add(light);

        const light1 = new DirectionalLight(0xffffff, 1);
        light.position.set(1, 2, 4);

        manager.getScene().add(light1);

        const groundGeo = new PlaneGeometry(50, 50);
        const groundMat = new MeshPhongMaterial({ color: 0xcc8866 });
        const ground = new Mesh(groundGeo, groundMat);
        ground.rotation.x = Math.PI * -0.5;
        ground.receiveShadow = true;

        manager.getScene().add(ground);

        const tank = new Object3D();
        manager.getScene().add(tank);

        const carWidth = 4;
        const carHeight = 1;
        const carLength = 8;

        const bodyGeo = new BoxGeometry(carWidth, carHeight, carLength);
        const bodyMat = new MeshPhongMaterial({ color: 0x6688aa });
        const body = new Mesh(bodyGeo, bodyMat);
        body.position.y = 1.4;
        body.castShadow = true;
        tank.add(body);

        const tankCamera = new PerspectiveCamera(75, 2, 0.1, 1000);
        tankCamera.position.y = 3;
        tankCamera.position.z = -6;
        tankCamera.rotation.y = Math.PI;
        body.add(tankCamera);

        const wheelRadius = 1;
        const wheelThickness = 0.5;
        const wheelSegments = 6;

        const wheelGeo = new CylinderGeometry(
            wheelRadius,
            wheelRadius,
            wheelThickness,
            wheelSegments
        );
        const wheelMat = new MeshPhongMaterial({ color: 0x888888 });

        const wheelPositions: [number, number, number][] = [
            [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, carLength / 3],
            [carWidth / 2 + wheelThickness / 2, -carHeight / 2, carLength / 3],
            [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, 0],
            [carWidth / 2 + wheelThickness / 2, -carHeight / 2, 0],
            [
                -carWidth / 2 - wheelThickness / 2,
                -carHeight / 2,
                -carLength / 3,
            ],
            [carWidth / 2 + wheelThickness / 2, -carHeight / 2, -carLength / 3],
        ];

        const wheels = wheelPositions.map((position) => {
            const wheel = new Mesh(wheelGeo, wheelMat);
            wheel.position.set(...position);
            wheel.rotation.z = Math.PI * 0.5;
            wheel.castShadow = true;

            body.add(wheel);
            return wheel;
        });

        const domeRadius = 2;
        const domeWidthSubdivisions = 12;
        const domeHeightSubdivisions = 12;
        const domePhiStart = 0;
        const domePhiEnd = Math.PI * 2;
        const domeThetaStart = 0;
        const domeThetaEnd = Math.PI * 0.5;
        const domeGeo = new SphereGeometry(
            domeRadius,
            domeWidthSubdivisions,
            domeHeightSubdivisions,
            domePhiStart,
            domePhiEnd,
            domeThetaStart,
            domeThetaEnd
        );
        const dome = new Mesh(domeGeo, bodyMat);

        dome.castShadow = true;
        body.add(dome);
        dome.position.y = 0.5;

        const turretWidth = 0.1;
        const turrentHeight = 0.1;
        const turretLength = carLength * 0.75 * 0.2;

        const turretGeo = new BoxGeometry(
            turretWidth,
            turrentHeight,
            turretLength
        );
        const turret = new Mesh(turretGeo, bodyMat);

        const turretPivot = new Object3D();
        turret.castShadow = true;
        turretPivot.scale.set(5, 5, 5);
        turretPivot.position.y = 0.5;
        turretPivot.position.z = turretLength * 0.5;
        turretPivot.add(turret);

        body.add(turretPivot);

        const turretCamera = new PerspectiveCamera(75, 2, 0.1, 1000);
        turretCamera.position.y = 0.75 * 0.2;
        turret.add(turretCamera);

        const targetGeo = new SphereGeometry(0.5, 5, 3);
        const targetMat = new MeshPhongMaterial({
            color: 0x00ff00,
            flatShading: true,
        });
        const target = new Mesh(targetGeo, targetMat);

        const targetOrbit = new Object3D();
        const targetElevation = new Object3D();
        const targetBob = new Object3D();

        target.castShadow = true;

        manager.getScene().add(targetOrbit);

        targetOrbit.add(targetElevation);
        targetElevation.position.z = carLength * 2;
        targetElevation.position.y = 8;
        targetElevation.add(targetBob);
        targetBob.add(target);

        const targetCamera = new PerspectiveCamera(75, 2, 0.1, 1000);
        const targetCameraPiovt = new Object3D();
        targetCamera.position.y = 1;
        targetCamera.position.z = -2;
        targetCamera.rotation.y = Math.PI;
        targetBob.add(targetCameraPiovt);
        targetCameraPiovt.add(targetCamera);

        const curve = new SplineCurve([
            new Vector2(-10, 0),
            new Vector2(-5, 5),
            new Vector2(0, 0),
            new Vector2(5, -5),
            new Vector2(10, 0),
            new Vector2(5, 10),
            new Vector2(-5, 10),
            new Vector2(-10, -10),
            new Vector2(-15, -8),
            new Vector2(-10, 0),
        ]);

        const points = curve.getPoints(50);

        const geo = new BufferGeometry().setFromPoints(points);
        const mat = new LineBasicMaterial({ color: 0xff0000 });
        const spline = new Line(geo, mat);
        spline.rotation.x = Math.PI * 0.5;
        spline.position.y = 0.05;

        manager.getScene().add(spline);

        const targetPosition = new Vector3();
        const tankPosition = new Vector2();
        const tankTarget = new Vector2();

        const cameras = [camera, turretCamera, targetCamera, tankCamera];

        manager.animate((_time) => {
            const time = _time * 0.001;
            if (manager.resizeRendererToDisplaySize()) {
                const canvas = manager.getRenderer().domElement;
                cameras.forEach((camera) => {
                    camera.aspect = canvas.clientWidth / canvas.clientHeight;
                    camera.updateProjectionMatrix();
                });
            }

            targetOrbit.rotation.y = time * 0.27;
            targetBob.position.y = Math.sin(time * 2) * 4;
            target.rotation.x = time * 7;
            target.rotation.y = time * 13;
            targetMat.emissive.setHSL((time * 10) % 1, 1, 0.25);
            targetMat.color.setHSL((time * 10) % 1, 1, 0.25);

            const tankTime = time * 0.05;
            curve.getPointAt(tankTime % 1, tankPosition);
            curve.getPointAt((tankTime + 0.01) % 1, tankTarget);
            tank.position.set(tankPosition.x, 0, tankPosition.y);
            tank.lookAt(tankTarget.x, 0, tankTarget.y);

            target.getWorldPosition(targetPosition);
            turretPivot.lookAt(targetPosition);

            turretCamera.lookAt(targetPosition);

            tank.getWorldPosition(targetPosition);
            targetCameraPiovt.lookAt(targetPosition);

            wheels.forEach((wheel) => {
                wheel.rotation.x = time * 3;
            });

            manager.addCamera(cameras[(time * 0.25) % cameras.length | 0]);
        });
    };

    return <canvas id="tank" ref={ref}></canvas>;
};

export default Tank;
