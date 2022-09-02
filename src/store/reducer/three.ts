import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type State = {
    value: number;
};

const initialState: State = {
    value: 12,
};

const slice = createSlice({
    name: "three",
    initialState,
    reducers: {
        increment(state, action: PayloadAction<number>) {
            state.value += action.payload;
        },
    },
});

export const { increment } = slice.actions;

export default slice.reducer;
