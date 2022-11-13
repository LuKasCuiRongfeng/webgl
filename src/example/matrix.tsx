import React, { useEffect, useRef } from "react";
import {
    AmbientLight,
    AxesHelper,
    BoxGeometry,
    BufferAttribute,
    BufferGeometry,
    DirectionalLight,
    DoubleSide,
    ExtrudeGeometry,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    PerspectiveCamera,
    Raycaster,
    Scene,
    Shape,
    ShapeGeometry,
    TextureLoader,
    Vector3,
    WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Tween } from "@tweenjs/tween.js";

const Matrx: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>();
    useEffect(() => {
        const renderer = new WebGLRenderer({ canvas: canvasRef.current });
        const scene = new Scene();
        const camera = new PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(0, 0, 50);
        const controls = new OrbitControls(camera, canvasRef.current);

        scene.add(new AmbientLight(0xffffff, 1));
        const light = new DirectionalLight(0xffffff, 3);
        light.position.set(-20, 20, 0);
        scene.add(light);

        const box = new BoxGeometry(20, 20, 20);
        const colors = [];
        const uvs = [];
        for (let i = 0; i < 24; i += 4) {
            colors.push(Math.random(), Math.random(), Math.random());
            colors.push(Math.random(), Math.random(), Math.random());
            colors.push(Math.random(), Math.random(), Math.random());
            colors.push(Math.random(), Math.random(), Math.random());
            uvs.push(0, 0);
            uvs.push(0, 1);
            uvs.push(1, 0);
            uvs.push(1, 1);
        }
        box.setAttribute(
            "color",
            new BufferAttribute(new Float32Array(colors), 3)
        );
        box.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
        box.computeVertexNormals();

        const obj = new Mesh(
            box,
            new MeshPhongMaterial({
                // vertexColors: true,
                side: DoubleSide,
                map: new TextureLoader().load(
                    "http://localhost:20000/assets/cat.jpg"
                ),
            })
        );

        obj.position.x = 20;
        obj.position.y = 20;

        obj.add(new AxesHelper(30));

        // scene.add(obj);

        // scene.add(new AxesHelper(100));

        const planeGeo = new BufferGeometry();
        const _ps = [0, 0, 0, 0, 10, 0, -10, 0, 0, -10, 10, 0];
        const _cs = [1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0];

        const _uvs = [0, 0, 0, 1, 1, 0, 1, 1];

        planeGeo.setIndex([0, 1, 2, 2, 1, 3]);

        planeGeo.setAttribute(
            "position",
            new BufferAttribute(new Float32Array(_ps), 3)
        );
        planeGeo.setAttribute(
            "color",
            new BufferAttribute(new Float32Array(_cs), 3)
        );
        planeGeo.setAttribute(
            "uv",
            new BufferAttribute(new Float32Array(_uvs), 2)
        );

        planeGeo.computeVertexNormals();

        const plane = new Mesh(
            planeGeo,
            new MeshPhongMaterial({
                vertexColors: true,
                side: DoubleSide,
                map: new TextureLoader().load(
                    "http://localhost:20000/assets/cat.jpg"
                ),
            })
        );

        // scene.add(plane);

        const x = 0,
            y = 0;
        const heartShape = new Shape();
        heartShape
            .moveTo(x + 25, y + 25)
            .bezierCurveTo(x + 25, y + 25, x + 20, y, x, y)
            .bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35)
            .bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95)
            .bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35)
            .bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y)
            .bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);

        const hgeo = new ExtrudeGeometry(heartShape, {
            depth: 8,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 2,
            bevelSize: 1,
            bevelThickness: 1,
        });
        const heart = new Mesh(
            hgeo,
            new MeshPhongMaterial({
                side: DoubleSide,
                // map: new TextureLoader().load(
                //     "http://localhost:20000/assets/cat.jpg"
                // ),
                color: "red",
            })
        );

        heart.scale.y = -1;

        heart.add(new AxesHelper(20));

        scene.add(heart);

        const t = new Tween(heart.scale)
            .to(new Vector3(1.2, -1.2, 1.2), 100)
            .repeat(Infinity)
            .yoyo(true)
            .start();

        const render = () => {
            heart.rotation.y += 0.05;
            t.update();
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        };
        render();

        canvasRef.current.addEventListener("click", (e) => {
            const bound = canvasRef.current.getBoundingClientRect();
            const x =
                (e.clientX - bound.width / 2 - bound.left) / (bound.width / 2);
            const y =
                -(e.clientY - bound.height / 2 - bound.top) /
                (bound.height / 2);

            const ray = new Raycaster();
            ray.setFromCamera({ x, y }, camera);
            const o = ray.intersectObjects([obj, plane], false);
            if (o.length > 0) {
                const face = o[0].face;
                console.log(o[0]);
                box.attributes.color.setXYZ(face.a, 1, 0, 0);
                box.attributes.color.setXYZ(face.b, 1, 0, 0);
                box.attributes.color.setXYZ(face.c, 1, 0, 0);
                // box.attributes.color.needsUpdate = true;
            }
        });
    }, []);
    return <canvas ref={canvasRef} width={1000} height={1000}></canvas>;
};

export default Matrx;
