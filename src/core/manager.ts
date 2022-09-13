import {
    Camera,
    Clock,
    Object3D,
    PerspectiveCamera,
    Scene,
    TextureLoader,
    WebGLRenderer,
    WebGLRendererParameters,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Helper from "./Helper";
import ControlGUI from "./gui";
class Manager {
    private renderer: WebGLRenderer;
    private scene: Scene;
    /** 只保留一个主视角相机 */
    private camera: Camera;
    private clock: Clock;
    private cameraOrbitControls: Map<number, OrbitControls> = new Map();

    private glTFLoader: GLTFLoader;
    private textureLoader: TextureLoader;

    constructor(parameters?: WebGLRendererParameters) {
        this.renderer = new WebGLRenderer(parameters);
        this.renderer.physicallyCorrectLights = true;
    }

    addScene(scene: Scene) {
        if (this.scene == undefined) {
            this.scene = scene;
        }
        return scene;
    }

    /** 设置主视角相机，这个相机在渲染的时候，自动和 场景一起被渲染器渲染 */
    addCamera(camera: Camera) {
        this.camera = camera;
        return camera;
    }

    getScene() {
        return this.scene;
    }

    getRenderer() {
        return this.renderer;
    }

    getCamera() {
        return this.camera;
    }

    /** 调整 canvas 内部尺寸匹配视口尺寸，同时会更新相机的 aspect，避免画面变形，
     * 在自适应窗口下为了保持画布不变形，需要在 animte loop 动画里一直调用这个方法
     */
    resizeRendererToDisplaySize() {
        const canvas = this.renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = (canvas.clientWidth * pixelRatio) | 0;
        const height = (canvas.clientHeight * pixelRatio) | 0;
        const needResize = canvas.width !== width || canvas.height !== height;

        if (needResize) {
            this.renderer.setSize(width, height, false);
            if (this.camera instanceof PerspectiveCamera) {
                const canvas = this.renderer.domElement;
                this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
                // 当动态改变摄像机参数的时候，必须主动调用一下来更新参数
                this.camera.updateProjectionMatrix();
            }
        }
        return needResize;
    }

    rotationAnimate(
        obj: Object3D,
        rotation?: { x?: number; y?: number; z?: number }
    ) {
        obj.rotation.x = rotation?.x || 0;
        obj.rotation.y = rotation?.y || 0;
        obj.rotation.z = rotation?.z || 0;
    }

    /** 循环动画， 传入 null 停止动画，如果不需要动画，比如只是一些
     * 静态的画面直接调用 `this.getRenderer().render()` 获得更好的性能
     */
    animate(callback?: ((time: number) => void) | null) {
        if (callback == null) {
            this.getRenderer().setAnimationLoop(null);
            return;
        }
        this.getRenderer().setAnimationLoop((time) => {
            callback(time);
            this.animate(callback);
        });
    }

    getHelper() {
        return Helper.getHelper();
    }

    getGUI() {
        return ControlGUI.getGUI();
    }

    getClock() {
        if (this.clock == undefined) {
            this.clock = new Clock();
        }
        return this.clock;
    }

    /** 获取该相机绑定的 orbitControls，如果没有则创建 */
    getOrbitControls(camera: Camera, domElement?: HTMLElement) {
        let controls = this.cameraOrbitControls.get(camera.id);
        if (controls == undefined) {
            controls = new OrbitControls(camera, domElement);
            this.cameraOrbitControls.set(camera.id, controls);
        }
        return controls;
    }

    GetGLTFLoader() {
        if (this.glTFLoader == undefined) {
            this.glTFLoader = new GLTFLoader();
        }
        return this.glTFLoader;
    }

    getTextureLoader() {
        if (this.textureLoader == undefined) {
            this.textureLoader = new TextureLoader();
        }
        return this.textureLoader;
    }

    /** 部分渲染画布，计算该元素和画布的重叠面积， 返回重叠部分的宽高比 */
    setScissorForElement(canvas: HTMLCanvasElement, elem: HTMLElement) {
        const canvasRect = canvas.getBoundingClientRect();
        const elemRect = elem.getBoundingClientRect();

        const right =
            Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
        const left = Math.max(0, elemRect.left - canvasRect.left);
        const bottom =
            Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
        const top = Math.max(0, elemRect.top - canvasRect.top);

        const width = Math.min(canvasRect.width, right - left);
        const height = Math.min(canvasRect.height, bottom - top);

        const positiveYUpBottom = canvasRect.height - bottom;

        this.getRenderer().setScissor(left, positiveYUpBottom, width, height);
        this.getRenderer().setViewport(left, positiveYUpBottom, width, height);

        return width / height;
    }
}

export default Manager;
