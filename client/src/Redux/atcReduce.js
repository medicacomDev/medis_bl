import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");

export const fetchAtc = createAsyncThunk("atc/fetchAtc", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "atc/allAtc", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const atc = await response.json();
  return atc;
});
export const getActiveAtc = createAsyncThunk("atc/getActiveAtc", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "atc/getActive", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const atc = await response.json();
  return atc;
});
export const atcChangerEtat = createAsyncThunk("atc/changerEtat", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "atc/changerEtat/"+id, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  });
  const atc = await response.status;
  return atc;
});
export const getIdMarcheAtc = createAsyncThunk("atc/getIdMarcheAtc", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "atc/getIdMarcheAtc/"+id, {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const atc = await response.json();
  return atc;
});

export const atcGetById = createAsyncThunk("atc/atcGetById", async (id1) => {
  const  id  = id1;
  const response = await fetch(Configuration.BACK_BASEURL + "atc/getAtc", {
    method: 'POST',
    headers: {
      'id':id,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const atc = await response.json();
  return atc;
});

export const getProduits = createAsyncThunk("atc/getProduits", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "atc/getProduits/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const atc = await response.json();
  return atc;
});

export const atcAdded = createAsyncThunk("atc/addAtc", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "atc/addAtc", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const atc = await response.json();
  return atc;
});
const atcReduce = createSlice({
  name: "atc",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
  },
  extraReducers: {

    [fetchAtc.pending]: (state, action) => {
      state.loading = true;
    },
    [fetchAtc.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, ...action.payload];
    },
    [fetchAtc.rejected]: (state, action) => {
      state.loading = false;
    },
    [atcGetById.pending]: (state, action) => {
      state.loading = true;
    },
    [atcGetById.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, action.payload];
    },
    [atcGetById.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});

export default atcReduce.reducer;
