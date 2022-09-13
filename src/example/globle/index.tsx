import Manager from "@/core/Manager";
import React, { useEffect, useRef } from "react";
import {
    BoxGeometry,
    BufferAttribute,
    Color,
    MathUtils,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PerspectiveCamera,
    Scene,
    SphereGeometry,
} from "three";

import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";

const Globle: React.FC = () => {
    const globle = useRef<HTMLCanvasElement>();

    useEffect(() => {
        query().then((text) => {
            const settings = parseData(text);
            render1(settings);
        });
    }, []);

    const query = async () => {
        const res = await fetch("http://localhost:20000/assets/population.asc");
        const text = await res.text();
        return text;
    };

    const parseData = (text: string) => {
        const settings = {
            data: [],
            min: 0,
            max: 0,
        };
        let min = 0,
            max = 0;
        text.split("\n").forEach((line) => {
            const parts = line.trim().split(/\s+/);

            if (parts.length === 2) {
                settings[parts[0]] = parseFloat(parts[1]);
            } else if (parts.length > 2) {
                const values = parts.map((v) => {
                    const value = parseFloat(v);
                    if (value === settings["NODATA_value"]) {
                        return undefined;
                    }
                    max = Math.max(max, value);
                    min = Math.min(min, value);
                    return value;
                });
                settings.data.push(values);
            }
        });
        settings["min"] = min;
        settings["max"] = max;

        return settings;
    };

    const draw = (setting: { data: [[]]; min: number; max: number }) => {
        const { data, min, max } = setting;
        const range = max - min;
        const ctx = globle.current.getContext("2d");

        ctx.canvas.width = setting["ncols"];
        ctx.canvas.height = setting["nrows"];

        ctx.canvas.style.width = `${setting["ncols"] * 2}px`;
        ctx.canvas.style.height = `${setting["nrows"] * 2}px`;

        ctx.fillStyle = "#444";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        data.forEach((row, latIndex) => {
            row.forEach((value, lonIndex) => {
                if (value == undefined) {
                    return;
                }
                const amount = (value - min) / range;
                const h = 1;
                const s = 1;
                const l = amount;
                ctx.fillStyle = `hsl(${h * 360},${s * 100}%,${l * 100}%)`;
                ctx.fillRect(lonIndex, latIndex, 1, 1);
            });
        });
    };

    const render = async (setting: {
        data: [[]];
        min: number;
        max: number;
    }) => {
        const { data, min, max } = setting;
        const range = max - min;

        const manager = new Manager({ canvas: globle.current });
        const scene = manager.addScene(new Scene());
        scene.background = new Color("black");

        const camera = new PerspectiveCamera(60, 2, 0.1, 10);
        manager.addCamera(camera);
        camera.position.z = 2.5;

        const controls = manager.getOrbitControls(
            camera,
            manager.getRenderer().domElement
        );
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minDistance = 1.2;
        controls.maxDistance = 4;
        controls.update();

        const textrue = await manager
            .getTextureLoader()
            .loadAsync("http://localhost:20000/assets/world.jpg");

        const sphereGeo = new SphereGeometry(1, 64, 32);
        const sphereMat = new MeshBasicMaterial({ map: textrue });
        scene.add(new Mesh(sphereGeo, sphereMat));

        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;
        const geo = new BoxGeometry(boxWidth, boxHeight, boxDepth);
        geo.applyMatrix4(new Matrix4().makeTranslation(0, 0, 0.5));

        const lonHelper = new Object3D();
        scene.add(lonHelper);

        const latHelper = new Object3D();
        lonHelper.add(latHelper);

        const positionHelper = new Object3D();
        positionHelper.position.z = 1;
        latHelper.add(positionHelper);

        const lonFudge = Math.PI * 0.5;
        const latFudge = Math.PI * -0.135;

        data.forEach((row, latIndex) => {
            row.forEach((value, lonIndex) => {
                if (value == undefined) {
                    return;
                }
                const amout = (value - min) / range;
                const mat = new MeshBasicMaterial();
                const h = MathUtils.lerp(0.7, 0.3, amout);
                const s = 1;
                const l = MathUtils.lerp(0.4, 1.0, amout);

                mat.color.setHSL(h, s, l);

                const mesh = new Mesh(geo, mat);
                scene.add(mesh);

                lonHelper.rotation.y =
                    MathUtils.degToRad(lonIndex + setting["xllcorner"]) +
                    lonFudge;
                latHelper.rotation.x =
                    MathUtils.degToRad(latIndex + setting["yllcorner"]) +
                    latFudge;

                positionHelper.updateWorldMatrix(true, false);

                mesh.applyMatrix4(positionHelper.matrixWorld);

                mesh.scale.set(0.005, 0.005, MathUtils.lerp(0.01, 0.5, amout));
            });
        });

        const animate = () => {
            manager.resizeRendererToDisplaySize();
            controls.update();
            manager.getRenderer().render(scene, camera);
        };

        manager.animate(animate);
    };

    const render1 = async (setting: {
        data: [[]];
        min: number;
        max: number;
    }) => {
        const { data, min, max } = setting;
        const range = max - min;

        const manager = new Manager({ canvas: globle.current });
        const scene = manager.addScene(new Scene());
        scene.background = new Color("black");

        const camera = new PerspectiveCamera(60, 2, 0.1, 10);
        manager.addCamera(camera);
        camera.position.z = 2.5;

        const controls = manager.getOrbitControls(
            camera,
            manager.getRenderer().domElement
        );
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minDistance = 1.2;
        controls.maxDistance = 4;
        controls.update();

        const textrue = await manager
            .getTextureLoader()
            .loadAsync("http://localhost:20000/assets/world.jpg");

        const sphereGeo = new SphereGeometry(1, 64, 32);
        const sphereMat = new MeshBasicMaterial({ map: textrue });
        scene.add(new Mesh(sphereGeo, sphereMat));

        const lonHelper = new Object3D();
        scene.add(lonHelper);

        const latHelper = new Object3D();
        lonHelper.add(latHelper);

        const positionHelper = new Object3D();
        positionHelper.position.z = 1;
        latHelper.add(positionHelper);

        const originHelper = new Object3D();
        originHelper.position.z = 0.5;
        positionHelper.add(originHelper);

        const geos = [];

        const lonFudge = Math.PI * 0.5;
        const latFudge = Math.PI * -0.135;

        const color = new Color();

        data.forEach((row, latIndex) => {
            row.forEach((value, lonIndex) => {
                if (value == undefined) {
                    return;
                }
                const amout = (value - min) / range;

                const boxWidth = 1;
                const boxHeight = 1;
                const boxDepth = 1;
                const geo = new BoxGeometry(boxWidth, boxHeight, boxDepth);

                lonHelper.rotation.y =
                    MathUtils.degToRad(lonIndex + setting["xllcorner"]) +
                    lonFudge;
                latHelper.rotation.x =
                    MathUtils.degToRad(latIndex + setting["yllcorner"]) +
                    latFudge;

                positionHelper.scale.set(
                    0.005,
                    0.005,
                    MathUtils.lerp(0.01, 0.5, amout)
                );
                originHelper.updateWorldMatrix(true, false);
                geo.applyMatrix4(originHelper.matrixWorld);

                const h = MathUtils.lerp(0.7, 0.3, amout);
                const s = 1;
                const l = MathUtils.lerp(0.4, 1.0, amout);

                color.setHSL(h, s, l);
                const rgb = color.toArray().map((v) => v * 255);

                const numVerts = geo.getAttribute("position").count;
                const itemSize = 3; // r g b

                const colors = new Uint8Array(itemSize * numVerts);

                colors.forEach((v, i) => {
                    colors[i] = rgb[i % 3];
                });

                const normalized = true;

                const colorAttrib = new BufferAttribute(
                    colors,
                    itemSize,
                    normalized
                );

                geo.setAttribute("color", colorAttrib);

                geos.push(geo);
            });
        });

        const mergeGeo = BufferGeometryUtils.mergeBufferGeometries(geos, false);
        const mat = new MeshBasicMaterial({ vertexColors: true });
        const mesh = new Mesh(mergeGeo, mat);

        scene.add(mesh);

        const animate = () => {
            manager.resizeRendererToDisplaySize();
            controls.update();
            manager.getRenderer().render(scene, camera);
        };

        manager.animate(animate);
    };
    return <canvas width={600} height={300} id="globle" ref={globle}></canvas>;
};

export default Globle;
