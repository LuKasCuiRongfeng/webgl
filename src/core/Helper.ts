import {
    AxesHelper,
    Camera,
    CameraHelper,
    DirectionalLight,
    DirectionalLightHelper,
    GridHelper,
    Material,
    Object3D,
    PointLight,
    PointLightHelper,
} from "three";

class Helper {
    private static helper: Helper;
    private constructor() {
        console.error("单例模式不允许用构造方法创建实例");
    }

    axesHelper(node: Object3D, size?: number) {
        let axes = node.getObjectByName("axes") as AxesHelper;
        if (axes == undefined) {
            axes = new AxesHelper(size);
            axes.name = "axes";
            axes.renderOrder = 2;
            if (axes.material instanceof Material) {
                axes.material.depthTest = false;
            }
            node.add(axes);
        }
        return axes;
    }

    gridHelper(node: Object3D, size?: number, divisions?: number) {
        let grid = node.getObjectByName("grid") as GridHelper;
        if (grid == undefined) {
            grid = new GridHelper(size, divisions);
            grid.name = "grid";
            grid.renderOrder = 1;
            if (grid.material instanceof Material) {
                grid.material.depthTest = false;
            }
            node.add(grid);
        }
        return grid;
    }

    cameraHelper(camera: Camera, node: Object3D) {
        let helper = node.getObjectByName(
            `camerahelper${camera.uuid}`
        ) as CameraHelper;
        if (helper == undefined) {
            helper = new CameraHelper(camera);
            helper.name = `camerahelper${camera.uuid}`;
            node.add(helper);
        }
        return helper;
    }

    directionalLightHelper(light: DirectionalLight, node: Object3D) {
        let helper = node.getObjectByName(
            `lighthelper${light.uuid}`
        ) as DirectionalLightHelper;
        if (helper == undefined) {
            helper = new DirectionalLightHelper(light);
            helper.name = `lighthelper${light.uuid}`;
            node.add(helper);
        }
        return helper;
    }

    pointLightHelper(light: PointLight, node: Object3D) {
        let helper = node.getObjectByName(
            `lighthelper${light.uuid}`
        ) as PointLightHelper;
        if (helper == undefined) {
            helper = new PointLightHelper(light);
            helper.name = `lighthelper${light.uuid}`;
            node.add(helper);
        }
        return helper;
    }

    /** 单例模式，保证项目只有一个 helper */
    static getHelper() {
        if (Helper.helper == undefined) {
            Helper.helper = new Helper();
        }
        return Helper.helper;
    }
}

export default Helper;
