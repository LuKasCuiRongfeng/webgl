import {
    Camera,
    Object3D,
    PerspectiveCamera,
    Raycaster,
    Scene,
    WebGLRenderer,
    WebGLRenderTarget,
} from "three";

type PickTypeMap = {
    raycaster: RaycasterPicker;
    gpu: GPUPicker;
};

class Picker {
    private static picker: Picker;
    private constructor() {
        console.error("单例模式不允许用构造方法创建实例");
    }

    setPicker<T extends keyof PickTypeMap>(pickType: T): PickTypeMap[T] {
        if (pickType === "raycaster") {
            // @ts-ignore
            return RaycasterPicker.getPicker();
        }
        // @ts-ignore
        return GPUPicker.getPicker();
    }

    static getPicker() {
        if (Picker.picker == undefined) {
            Picker.picker = new Picker();
        }
        return Picker.picker;
    }
}

class RaycasterPicker {
    private static picker: RaycasterPicker;
    private raycaster: Raycaster;
    private constructor() {
        console.error("单例模式不允许用构造方法创建实例");
    }

    pick(
        normalizedPosition: { x: number; y: number },
        parent: Object3D,
        camera: Camera
    ) {
        if (this.raycaster == undefined) {
            this.raycaster = new Raycaster();
        }

        this.raycaster.setFromCamera(normalizedPosition, camera);
        const intersectedObjs = this.raycaster.intersectObjects(
            parent.children
        );

        return intersectedObjs[0].object;
    }

    static getPicker() {
        if (RaycasterPicker.picker == undefined) {
            RaycasterPicker.picker = new RaycasterPicker();
        }
        return RaycasterPicker.picker;
    }
}

/** 想要使用 gpupicker，首先需要离屏渲染
 * @link https://threejs.org/manual/#zh/picking
 */
class GPUPicker {
    private static picker: GPUPicker;
    private texture: WebGLRenderTarget;
    private pixelBuffer: Uint8Array;
    private constructor() {
        console.error("单例模式不允许用构造方法创建实例");
        this.texture = new WebGLRenderTarget(1, 1);
        this.pixelBuffer = new Uint8Array(4);
    }

    pick(
        cssPosition: { x: number; y: number },
        scene: Scene,
        camera: PerspectiveCamera,
        renderer: WebGLRenderer
    ) {
        camera.setViewOffset(
            renderer.getContext().drawingBufferWidth,
            renderer.getContext().drawingBufferHeight,
            (cssPosition.x * renderer.pixelRatio) | 0,
            (cssPosition.y * renderer.pixelRatio) | 0,
            1,
            1
        );

        renderer.setRenderTarget(this.texture);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);

        camera.clearViewOffset();

        renderer.readRenderTargetPixels(
            this.texture,
            0,
            0,
            1,
            1,
            this.pixelBuffer
        );

        const id =
            (this.pixelBuffer[0] << 16) |
            (this.pixelBuffer[1] << 8) |
            this.pixelBuffer[2];

        return id;
    }

    static getPicker() {
        if (GPUPicker.picker == undefined) {
            GPUPicker.picker = new GPUPicker();
        }
        return GPUPicker.picker;
    }
}

export default Picker;
