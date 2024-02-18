import {createSlice} from "@reduxjs/toolkit"

const initialState={
    username:"",
    token:"",
    isLogin:false,
    email:"",
}

const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        login(state,action){
            state.username=action.payload.username;
            state.isLogin=!(action.payload.token);
            state.token=action.payload.token;
            state.email=action.payload.email;
        },

        logout(state,action){
            state.email="";
            state.isLogin=false;
            state.email="";
            state.username="";
        }


        
    }
})
