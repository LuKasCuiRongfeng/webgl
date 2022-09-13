import Manager from "@/core/Manager";
import React, { useEffect, useRef } from "react";
import {
    DirectionalLight,
    ExtrudeGeometry,
    Mesh,
    MeshPhongMaterial,
    PerspectiveCamera,
    Scene,
    Shape,
} from "three";

const Objs: React.FC = () => {
    const ref = useRef<HTMLCanvasElement>();

    useEffect(() => {
        ref.current && render();
    }, []);

    const createShape = () => {
        const shape = new Shape();
        const x = -2.5;
        const y = -5;
        shape.moveTo(x + 2.5, y + 2.5);
        shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
        shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
        shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
        shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
        shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
        shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

        const geo = new ExtrudeGeometry(shape, {
            steps: 2,
            depth: 2,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 1,
            bevelSegments: 2,
        });
        return geo;
    };
    const render = () => {
        const manager = new Manager({ canvas: ref.current });

        const scene = manager.addScene(new Scene());

        const camera = manager.addCamera(new PerspectiveCamera(75, 1, 0.1, 20));
        camera.position.z = 10;

        const mat = new MeshPhongMaterial({ color: "green" });

        const obj = new Mesh(createShape(), mat);

        const light = new DirectionalLight("white", 1);
        light.position.set(-6, 6, 6);

        scene.add(light);

        scene.add(obj);

        manager.animate((time) => {
            const _time = time * 0.001;
            manager.rotationAnimate(obj, {
                x: 1 * _time,
                y: 1 * _time,
                z: 1 * _time,
            });
        });
    };

    return <canvas id="objs" ref={ref}></canvas>;
};

export default Objs;
