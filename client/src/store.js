import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./Redux/usersReduce";
import produitReducer from "./Redux/produitReduce";
import roleReducer from "./Redux/roleReduce";
import clustringReducer from "./Redux/clustringReduce";
import settingsReducer from "./Redux/settingsReduce";
import ligneImsReducer from "./Redux/ligneImsReduce";
import marcheImsReducer from "./Redux/marcheImsReduce";
import fournisseurReducer from "./Redux/fournisseurReduce";
import imsReducer from "./Redux/imsReduce";
import pharmacieReducer from "./Redux/pharmacieReduce";
import packReducer from "./Redux/packReduce";
import blReducer from "./Redux/blReduce";
import dashReducer from "./Redux/dashReduce";
import secteurReducer from "./Redux/secteurReduce";
import actionReducer from "./Redux/actionReduce";
import segmentReducer from "./Redux/segmentReduce";
import todoListReducer from "./Redux/todoListReduce";
import messageriesReducer from "./Redux/messageriesReduce";
import commandesReducer from "./Redux/commandesReduce";
import notificationReduce from "./Redux/notificationReduce";
import rootBaseReduce from "./Redux/rootBaseReduce";
import atcReduce from "./Redux/atcReduce";

export default configureStore({
  reducer: {
    users: usersReducer,
    produit: produitReducer,
    role: roleReducer,
    clustring: clustringReducer,
    settings: settingsReducer,
    ligneIms: ligneImsReducer,
    marcheIms: marcheImsReducer,
    fournisseur: fournisseurReducer,
    ims: imsReducer,
    pharmacie: pharmacieReducer,
    pack: packReducer,
    bl: blReducer,
    dash: dashReducer,
    secteur: secteurReducer,
    action: actionReducer,
    segment: segmentReducer,
    todoList: todoListReducer,
    messageries: messageriesReducer,
    commandes: commandesReducer,
    notification: notificationReduce,
    rootBase: rootBaseReduce,
    atc: atcReduce,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false,}),
});
