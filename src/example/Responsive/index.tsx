import Manager from "@/core/Manager";
import React, { useEffect, useRef } from "react";
import {
    AmbientLight,
    AnimationClip,
    AnimationMixer,
    BoxGeometry,
    BufferGeometry,
    Color,
    DirectionalLight,
    DoubleSide,
    FogExp2,
    HemisphereLight,
    Material,
    Mesh,
    MeshPhongMaterial,
    NumberKeyframeTrack,
    PerspectiveCamera,
    PlaneGeometry,
    Scene,
    VectorKeyframeTrack,
} from "three";
import "./index.css";

const SPEED = Math.PI;

const Responsive: React.FC = () => {
    const ref = useRef<HTMLCanvasElement>();
    const view1 = useRef<HTMLDivElement>();
    const view2 = useRef<HTMLDivElement>();

    useEffect(() => {
        render();
    }, []);

    const render = async () => {
        if (ref.current == null) {
            return;
        }
        const canvas = ref.current;
        const manager = new Manager({ canvas, antialias: true });
        manager.getRenderer().shadowMap.enabled = true;
        const camera = manager.addCamera(
            new PerspectiveCamera(45, 1.5, 2, 100)
        ) as PerspectiveCamera;
        camera.position.set(0, 0, 10);

        manager.getOrbitControls(manager.getCamera(), view1.current);

        // 定义辅助相机
        const assistCamera = new PerspectiveCamera(60, 2, 0.1, 500);
        assistCamera.position.set(5, 5, 5);
        assistCamera.lookAt(0, 0, 0);
        manager
            .getOrbitControls(assistCamera, view2.current)
            .target.set(0, 0, 0);
        manager.getOrbitControls(assistCamera).update();

        const scene = manager.addScene(new Scene());

        scene.background = new Color("white");

        const fog = new FogExp2("white", 0.1);
        scene.fog = fog;

        const light = new DirectionalLight("white", 1);
        light.position.set(-2, -2, 10);
        light.castShadow = true;

        manager.getHelper().directionalLightHelper(light, scene);

        manager.getHelper().cameraHelper(light.shadow.camera, scene);

        scene.add(light);
        light.target.position.set(2, 2, 0);
        // light.target.updateMatrixWorld()
        scene.add(light.target);

        const hemi = new HemisphereLight("blue", "white", 1);

        // const ambient = new AmbientLight("white", 1);
        // scene.add(ambient);
        scene.add(hemi);

        const planeGeo = new PlaneGeometry(30, 30);
        const plane = new Mesh(
            planeGeo,
            new MeshPhongMaterial({ color: "white", side: DoubleSide })
        );
        plane.receiveShadow = true;
        manager.getHelper().axesHelper(plane);

        // manager.getHelper().gridHelper(plane, 30, 30).rotation.x = Math.PI * 0.5;

        scene.add(plane);

        const geo = new BoxGeometry(1, 1, 1);

        // const cubes = [
        //     createObj(manager, geo, "green", 0),
        //     // createObj(manager, geo, "red", -1),
        //     // createObj(manager, geo, "yellow", 1),
        // ];
        const obj = createObj(manager, geo, "green", 0.5);
        obj.position.set(-1, 1, 1);
        // obj.rotation.y = Math.PI * 0.5
        obj.rotation.y = Math.PI * 0.25;
        // obj.scale.set(1, 1, 1)
        obj.scale.x = 3;
        // obj.position.x = 3
        // obj.position.z = -2

        manager.getHelper().axesHelper(obj);

        manager.getOrbitControls(
            manager.getCamera(),
            manager.getRenderer().domElement
        ).enableDamping = true;

        const data = await manager
            .GetGLTFLoader()
            .loadAsync("http://localhost:20000/assets/Flamingo.glb");
        const model = data.scene.children[0] as Mesh;
        model.castShadow = true;
        model.receiveShadow = true;

        manager.getHelper().axesHelper(model, 10);
        model.scale.set(0.05, 0.05, 0.05);
        model.position.x = 0;
        model.position.z = 5;

        const model1 = model.clone();
        model1.position.set(-5, 5, 0);
        const model2 = model.clone();
        model2.position.set(5, 5, 0);

        manager
            .getOrbitControls(manager.getCamera())
            .target.copy(model.position);

        scene.add(model, model1, model2);

        const times = [0, 3, 6];
        const values = [0, 0, 0, 2, 2, 2, 0, 0, 0];
        const positionKF = new VectorKeyframeTrack(".position", times, values);

        const opacityKF = new NumberKeyframeTrack(
            ".material.opacity",
            [0, 1, 2, 3, 4, 5, 6],
            [0, 1, 0, 1, 0, 1, 0]
        );

        const tracks = [positionKF, opacityKF];
        const length = -1;

        const clip = new AnimationClip("fuck", length, tracks);

        const mixer = new AnimationMixer(model);
        const action = mixer.clipAction(data.animations[0]);
        action.play();

        console.log(scene);

        const animate = () => {
            manager.resizeRendererToDisplaySize();
            const delta = manager.getClock().getDelta();
            manager.getOrbitControls(manager.getCamera()).update();
            mixer.update(delta);

            manager.getRenderer().setScissorTest(true);

            // 主视角
            const aspectView1 = manager.setScissorForElement(
                manager.getRenderer().domElement,
                view1.current
            );
            camera.aspect = aspectView1;
            camera.updateProjectionMatrix;
            manager.getHelper().cameraHelper(camera, scene).update();
            manager.getHelper().cameraHelper(camera, scene).visible = false;

            (scene.background as Color).set(0x000000);
            manager.getRenderer().render(scene, camera);

            // 第二台下相机
            const aspectView2 = manager.setScissorForElement(
                manager.getRenderer().domElement,
                view2.current
            );
            assistCamera.aspect = aspectView2;
            assistCamera.updateProjectionMatrix();

            manager.getHelper().cameraHelper(camera, scene).visible = true;
            (scene.background as Color).set(0x000040);

            manager.getRenderer().render(scene, assistCamera);

            // obj.rotation.z += SPEED * delta;
            // cubes.forEach((cube, index) => {
            //     const speed = 1 + index * 0.1;
            //     const rotation = seconds * speed;
            //     cube.rotation.z += delta * SPEED;
            //     // cube.rotation.y = rotation;
            //     // cube.position.x = 1
            //     // cube.position.x = -1
            // });
        };

        manager.animate(animate);
    };

    const createObj = (
        manager: Manager,
        geo: BufferGeometry,
        color: string,
        x: number
    ) => {
        const mat = new MeshPhongMaterial({ color });

        const cube = new Mesh(geo, mat);
        // manager.getScene().add(cube);

        cube.position.x = x;

        return cube;
    };

    return (
        <>
            <canvas ref={ref} id="reponsive"></canvas>
            <div className="split">
                <div ref={view1} id="view1" tabIndex={1}></div>
                <div ref={view2} id="view2" tabIndex={2}></div>
            </div>
        </>
    );
};

export default Responsive;
