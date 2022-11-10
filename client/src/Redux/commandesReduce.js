import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");
export const commandeAdded = createAsyncThunk("commande/addCommande", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "commande/addCommande", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const commande = await response.status;
  return commande;
});
export const getAllCommande = createAsyncThunk("commande/getCommande", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "commande/getCommande/"+id, {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  });
  const commande = await response.json();
  return commande;
});
export const getCommandeByEtat = createAsyncThunk("commande/getCommandeByEtat", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "commande/getCommandeByEtat/"+action.id, {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  });
  const commande = await response.json();
  return commande;
});
export const saveDecharge = createAsyncThunk("commande/saveDecharge", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "commande/saveDecharge/"+action.idBl, {
    method: 'POST',
    headers: {
      'Accept': 'application/*',
      'x-access-token':token
    },
    body:action.fileArray
  });
  const commande = await response.json();
  return commande;
});
export const getAllParmacieCmd = createAsyncThunk("commande/getAllParmacieCmd", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "commande/getAllParmacieCmd", {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  });
  const commande = await response.json();
  return commande;
});
//getBlPayer
export const getDecharge = createAsyncThunk("commande/getDecharge", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "commande/getDecharge/"+id, {
    method: "GET",
    responseType: "blob",    
  }).then(response => response.blob())
  .then(function(myBlob) {
    return((myBlob))
  })
  .catch((error) => {
    console.log(error);
  })
  const files = await response;
  return files;
});
export const totalCaByAction = createAsyncThunk("commande/totalCaByAction", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "commande/totalCaByAction/"+id, {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  });
  const commande = await response.json();
  return commande;
});
const dashReduce = createSlice({
  name: "dash",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {},
  extraReducers: {},
});

/* export const {} = dashReduce.actions; */

export default dashReduce.reducer;
