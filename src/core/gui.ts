import GUI from "lil-gui";

class ControlGUI {
    private static gui: GUI;

    private constructor() {
        console.error("单例模式不允许用构造方法创建实例");
    }

    static getGUI() {
        if (!ControlGUI.gui) {
            ControlGUI.gui = new GUI();
        }
        return ControlGUI.gui;
    }
}

export default ControlGUI;
