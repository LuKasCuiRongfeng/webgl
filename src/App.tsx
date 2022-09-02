import React from "react";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { increment } from "./store/reducer/three";

const App: React.FC = () => {
    const dispatch = useAppDispatch();
    const value = useAppSelector((state) => state.three.value);

    return (
        <div>
            <button
                onClick={() => {
                    dispatch(increment(23));
                }}
            >
                {value}
            </button>
        </div>
    );
};

export default App;
