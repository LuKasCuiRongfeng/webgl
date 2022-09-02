import { configureStore } from "@reduxjs/toolkit";
import three from "./reducer/three";

const store = configureStore({
    reducer: {
        three,
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
