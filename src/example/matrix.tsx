import React, { useEffect, useRef } from "react";
import {
    AmbientLight,
    AxesHelper,
    BoxGeometry,
    BufferAttribute,
    DirectionalLight,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    PerspectiveCamera,
    Raycaster,
    Scene,
    TextureLoader,
    WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Matrx: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>();
    useEffect(() => {
        const renderer = new WebGLRenderer({ canvas: canvasRef.current });
        const scene = new Scene();
        const camera = new PerspectiveCamera(75, 1, 0.1, 100);
        camera.position.set(0, 0, 50);
        const controls = new OrbitControls(camera, canvasRef.current);

        scene.add(new AmbientLight(0xffffff, 1));
        const light = new DirectionalLight(0xffffff, 3);
        light.position.set(-20, 20, 0);
        scene.add(light);

        const box = new BoxGeometry(20, 20, 20);
        const colors = [];
        const uvs = [];
        for (let i = 0; i < 36; i++) {
            colors.push(Math.random(), Math.random(), Math.random());
            uvs.push(i * 0.35, i * 0.35);
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
                vertexColors: true,
                map: new TextureLoader().load(
                    "http://localhost:20000/assets/cat.jpg"
                ),
            })
        );

        obj.position.x = 20;
        obj.position.y = 20;

        obj.add(new AxesHelper(30));

        scene.add(obj);

        scene.add(new AxesHelper(100));

        const render = () => {
            // obj.rotation.x += 0.05;
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        };
        render();

        canvasRef.current.addEventListener("click", (e) => {
            console.log(111);
            const bound = canvasRef.current.getBoundingClientRect();
            const x =
                (e.clientX - bound.width / 2 - bound.left) / (bound.width / 2);
            const y =
                -(e.clientY - bound.height / 2 - bound.top) /
                (bound.height / 2);

            const ray = new Raycaster();
            ray.setFromCamera({ x, y }, camera);
            const o = ray.intersectObjects([obj], false);
            if (o.length > 0) {
                const face = o[0].face;
                box.attributes.color.setXYZ(face.a, 1, 0, 0);
                box.attributes.color.setXYZ(face.b, 1, 0, 0);
                box.attributes.color.setXYZ(face.c, 1, 0, 0);
                box.attributes.color.needsUpdate = true;
            }
        });
    }, []);
    return <canvas ref={canvasRef} width={1000} height={1000}></canvas>;
};

export default Matrx;
