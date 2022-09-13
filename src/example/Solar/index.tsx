import Manager from "@/core/Manager";
import React, { useEffect, useRef } from "react";
import {
    Mesh,
    MeshPhongMaterial,
    Object3D,
    PerspectiveCamera,
    PointLight,
    Scene,
    SphereGeometry,
} from "three";
import "./index.css";

const Solar: React.FC = () => {
    const ref = useRef<HTMLCanvasElement>();

    useEffect(() => {
        render();
    }, []);

    const create = () => {
        const radius = 1;
        const widthSegments = 6;
        const heightSegments = 6;

        const geo = new SphereGeometry(radius, widthSegments, heightSegments);

        return geo;
    };

    const render = () => {
        if (ref.current == undefined) {
            return;
        }
        const manager = new Manager({ canvas: ref.current });

        manager.addScene(new Scene());

        manager.addCamera(new PerspectiveCamera(45, 1, 0.1, 1000));
        manager.getCamera().position.set(0, 50, 0);
        manager.getCamera().lookAt(0, 0, 0);
        manager.getCamera().up.set(0, 0, 1);

        const solarSystem = new Object3D();

        const earthOrbit = new Object3D();
        earthOrbit.position.x = 10;

        solarSystem.add(earthOrbit);

        const sun = new Mesh(
            create(),
            new MeshPhongMaterial({ emissive: "#ffff00" })
        );
        sun.scale.set(5, 5, 5);

        const earth = new Mesh(
            create(),
            new MeshPhongMaterial({ color: "#2233ff", emissive: "#112244" })
        );

        const moon = new Mesh(
            create(),
            new MeshPhongMaterial({ color: "#888888", emissive: "#222222" })
        );
        moon.scale.set(0.5, 0.5, 0.5);
        moon.position.x = 2;

        earthOrbit.add(earth);
        earthOrbit.add(moon);

        solarSystem.add(sun);

        manager.getScene().add(solarSystem);

        const light = new PointLight("white", 3);
        manager.getScene().add(light);

        const helper = manager.axisGridHelper(earth);
        // helper.axesHelper();
        helper.gridHelper(4, 10);

        manager.getGUI().add(helper, "visible").name("visible");

        // gui.add(helper, "visible").name("axes-grid")

        manager.animate((time) => {
            manager.rotationAnimate(solarSystem, { y: time * 0.001 });
            manager.rotationAnimate(sun, { y: time * 0.001 });
            manager.rotationAnimate(earth, { y: time * 0.001 });
            manager.rotationAnimate(earthOrbit, { y: time * 0.001 });
        });
    };

    return <canvas id="solar" ref={ref}></canvas>;
};

export default Solar;
