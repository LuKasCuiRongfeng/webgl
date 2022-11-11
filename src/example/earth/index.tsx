import Manager from "@/core/Manager";
import React, { useRef } from "react";
import { useEffect } from "react";
import {
    Color,
    DataTexture,
    MathUtils,
    Matrix3,
    Mesh,
    MeshBasicMaterial,
    NearestFilter,
    Object3D,
    PerspectiveCamera,
    Scene,
    SphereGeometry,
    Vector3,
} from "three";

import "./index.css";

type Country = {
    name: string;
    min: [number, number];
    max: [number, number];
    area: number;
    lat: number;
    lon: number;
    population: number;
    position: Vector3;
    elem: HTMLDivElement;
};

const Earth: React.FC = () => {
    const earth = useRef<HTMLCanvasElement>();
    const labels = useRef<HTMLDivElement>();

    useEffect(() => {
        earth.current && render();
    }, []);

    const render = async () => {
        const manager = new Manager({ canvas: earth.current, antialias: true });

        const scene = manager.addScene(new Scene());
        scene.background = new Color("#246");

        const camera = new PerspectiveCamera(60, 2, 0.1, 10);
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

        const pickingScene = new Scene();
        pickingScene.background = new Color(0);

        const tempColor = new Color();

        function get255BasedColor(color: string) {
            tempColor.set(color);
            const base = tempColor.toArray().map((v) => v * 255);
            base.push(255);
            return base;
        }

        const maxNumCountries = 512;
        const paletteTextrueWidth = maxNumCountries;
        const paletteTextureHeight = 1;
        const palette = new Uint8Array(paletteTextrueWidth * 4);
        const paletteTexture = new DataTexture(
            palette,
            paletteTextrueWidth,
            paletteTextureHeight
        );

        paletteTexture.minFilter = NearestFilter;
        paletteTexture.magFilter = NearestFilter;

        function setPaletteColor(index: number, color: number[]) {
            palette.set(color, index * 4);
        }

        function resetPalette() {
            for (let i = 1; i < maxNumCountries; i++) {
                setPaletteColor(i, unselectedColor);
            }
            setPaletteColor(0, oceanColor);
            paletteTexture.needsUpdate = true;
        }

        const selectedColor = get255BasedColor("red");
        const unselectedColor = get255BasedColor("#444");
        const oceanColor = get255BasedColor("rgb(100, 200, 255)");

        resetPalette();

        const teture = await manager
            .getTextureLoader()
            .loadAsync("http://localhost:20000/assets/world.jpg");

        const geometry = new SphereGeometry(1, 64, 32);
        const material = new MeshBasicMaterial({ map: teture });

        scene.add(new Mesh(geometry, material));

        const countryInfos = await fetchData<Country[]>();

        const lonFudge = Math.PI * 1.5;
        const latFudge = Math.PI;

        const lonHelper = new Object3D();
        const latHelper = new Object3D();

        lonHelper.add(latHelper);

        const positionHelper = new Object3D();
        positionHelper.position.z = 1;

        latHelper.add(positionHelper);

        for (const country of countryInfos) {
            const { lat, lon, min, max, name } = country;

            lonHelper.rotation.y = MathUtils.degToRad(lon) + lonFudge;
            latHelper.rotation.x = MathUtils.degToRad(lat) + latFudge;

            positionHelper.updateWorldMatrix(true, false);

            const position = new Vector3();
            positionHelper.getWorldPosition(position);

            country.position = position;

            const width = max[0] - min[0];
            const height = max[1] - min[1];
            const area = width * height;
            country.area = area;

            const elem = document.createElement("div");
            elem.textContent = name;
            labels.current.appendChild(elem);
            country.elem = elem;
        }

        const tempV = new Vector3();
        const cameraToPoint = new Vector3();
        const cameraPosition = new Vector3();
        const normalMatrix = new Matrix3();

        const settings = {
            minArea: 20,
            maxVisibleDot: -0.2,
        };

        function updateLabels() {
            if (!countryInfos) {
                return;
            }
            const large = settings.minArea * settings.minArea;

            normalMatrix.getNormalMatrix(camera.matrixWorldInverse);

            camera.getWorldPosition(cameraPosition);

            for (const country of countryInfos) {
                const { position, elem, area } = country;

                if (area < large) {
                    elem.style.display = "none";
                    continue;
                }

                tempV.copy(position);
                tempV.applyMatrix3(normalMatrix);

                cameraToPoint.copy(position);
                cameraToPoint
                    .applyMatrix4(camera.matrixWorldInverse)
                    .normalize();

                const dot = tempV.dot(cameraToPoint);

                if (dot > settings.maxVisibleDot) {
                    elem.style.display = "none";
                    continue;
                }

                elem.style.display = "";

                tempV.copy(position);
                tempV.project(camera);

                const x =
                    (tempV.x * 0.5 + 0.5) *
                    manager.getRenderer().domElement.clientWidth;
                const y =
                    (tempV.y * -0.5 + 0.5) *
                    manager.getRenderer().domElement.clientHeight;

                elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;

                elem.style.zIndex =
                    (((-tempV.z * 0.5 + 0.5) * 100000) | 0) + "";
            }
        }

        manager.animate(() => {
            manager.resizeRendererToDisplaySize();

            controls.update();

            updateLabels();

            manager.getRenderer().render(scene, camera);
        });
    };

    async function fetchData<T>(): Promise<T> {
        const res = await fetch(
            "http://localhost:20000/assets/country-info.json"
        );
        return res.json();
    }
    return (
        <>
            <canvas id="earth" ref={earth}></canvas>
            <div id="labels" ref={labels}></div>
        </>
    );
};

export default Earth;
