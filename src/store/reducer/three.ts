import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WebGLRenderer } from "three";

type State = {
    renderer: WebGLRenderer;
};

const initialState: State = {
    renderer: null,
};

const slice = createSlice({
    name: "three",
    initialState,
    reducers: {
        setRenderer(state, action: PayloadAction<WebGLRenderer>) {
            state.renderer = action.payload;
        },
    },
});

export const { setRenderer } = slice.actions;

export default slice.reducer;
