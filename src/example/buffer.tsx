import React, { useEffect, useRef } from "react";
import {
    Scene,
    BufferGeometry,
    PerspectiveCamera,
    Line,
    LineBasicMaterial,
    WebGLRenderer,
    AmbientLight,
    BufferAttribute,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

const Test: React.FC = () => {
    const canvas = useRef();
    useEffect(() => {
        const can = canvas.current;
        if (can) {
            const renderer = new WebGLRenderer({ canvas: can });
            const scene = new Scene();
            const camera = new PerspectiveCamera(75, 1, 0.1, 1000);
            camera.position.set(0, 0, 50);
            const light = new AmbientLight("white", 1);

            const controls = new OrbitControls(camera, can);

            const count = 2000000;

            const geo = new BufferGeometry();
            geo.setAttribute(
                "position",
                new BufferAttribute(new Float32Array(count * 3), 3)
            );
            geo.setAttribute(
                "color",
                new BufferAttribute(new Float32Array(count * 3), 3)
            );

            geo.setDrawRange(0, 10);

            const mat = new LineBasicMaterial({
                vertexColors: true,
                linewidth: 5.0,
            });

            const line = new Line(geo, mat);

            scene.add(line);
            scene.add(light);

            const render = () => {
                renderer.render(scene, camera);
                controls.update();
                requestAnimationFrame(render);
            };

            render();

            let x = 0,
                y = 0,
                z = 0;

            setTimeout(() => {
                const positions = line.geometry.attributes.position.array;
                const colors = line.geometry.attributes.color.array;
                for (let i = 0; i < count; i++) {
                    positions[i * 3 + 0] = x;
                    positions[i * 3 + 1] = y;
                    positions[i * 3 + 2] = z;
                    colors[i * 3 + 0] = Math.random();
                    colors[i * 3 + 1] = Math.random();
                    colors[i * 3 + 2] = Math.random();

                    x += (Math.random() - 0.5) * 30;
                    y += (Math.random() - 0.5) * 30;
                    z += (Math.random() - 0.5) * 30;
                }

                line.geometry.setDrawRange(0, 2000000);

                line.geometry.attributes.position.needsUpdate = true;
                line.geometry.attributes.color.needsUpdate = true;

                const geo1 = new BufferGeometry();
                const c1 = 3000;
                const ps = [];
                const cs = [];
                for (let i = 0; i < c1; i++) {
                    ps.push(
                        (Math.random() - 0.3) * 30,
                        (Math.random() - 0.3) * 30,
                        (Math.random() - 0.3) * 30
                    );
                    cs.push(Math.random(), Math.random(), Math.random());
                }
                geo1.setAttribute(
                    "position",
                    new BufferAttribute(new Float32Array(ps), 3)
                );
                geo1.setAttribute(
                    "color",
                    new BufferAttribute(new Float32Array(cs), 3)
                );

                const mg = mergeBufferGeometries([geo, geo1], false);
                const line1 = new Line(
                    mg,
                    new LineBasicMaterial({ vertexColors: true, linewidth: 3 })
                );
                scene.add(line1);
            }, 2000);
        }
    });
    return <canvas ref={canvas} width={1000} height={1000}></canvas>;
};

export default Test;
