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
import "./index.css";

const Objs: React.FC = () => {
    const ref = useRef<HTMLCanvasElement>();

    useEffect(() => {
        ref.current && render();
    }, []);

    const render = async () => {
        const manager = new Manager({ canvas: ref.current, antialias: true });

        const scene = manager.addScene(new Scene());

        const camera = manager.addCamera(new PerspectiveCamera(75, 1, 0.1, 20));
        camera.position.z = 10;

        const texture = await manager
            .getTextureLoader()
            .loadAsync("http://localhost:20000/assets/naked.jpg");

        const imgAspect = texture.image
            ? texture.image.width / texture.image.height
            : 1;
        const aspect = imgAspect / manager.getCanvasAspect();

        texture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
        texture.repeat.x = aspect > 1 ? 1 / aspect : 1;

        texture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
        texture.repeat.y = aspect > 1 ? 1 : aspect;

        // texture.rotation = Math.PI * 0.5

        scene.background = texture;

        manager.animate(() => {
            manager.resizeRendererToDisplaySize();

            manager.getRenderer().render(scene, camera);
        });
    };

    return <canvas id="objs" ref={ref}></canvas>;
};

export default Objs;
