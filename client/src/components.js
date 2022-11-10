
//User
import ListUser from "./Pages/Settings/User/ListUser";
import AjouterUser from "./Pages/Settings/User/AjouterUser";

//Role
import ListRole from "./Pages/Settings/Role/ListRole";
import AjouterRole from "./Pages/Settings/Role/AjouterRole";

//Settings
import Settings from "./Pages/Settings";

//Produit
import ListProduit from "./Pages/Settings/Produit/ListProduit";
import AjouterProduit from "./Pages/Settings/Produit/AjouterProduit";
import ListProduitFour from "./Pages/Settings/Produit/ListProduitFour";

//LigneIms
import AjouterLigneIms from "./Pages/Settings/LigneIms/AjouterLigneIms";
import ListLigneIms from "./Pages/Settings/LigneIms/ListLigneIms";

//MarcheIms
import ListMarcheIms from "./Pages/Settings/MarcheIms/ListMarcheIms";
import AjouterMarcheIms from "./Pages/Settings/MarcheIms/AjouterMarcheIms";

//Fournisseur
import AjouterFournisseur from "./Pages/Settings/Fournisseur/AjouterFournisseur";
import ListFournisseur from "./Pages/Settings/Fournisseur/ListFournisseur";

//Ims
import AjouterIms from "./Pages/Settings/Ims/AjouterIms";
import ListIms from "./Pages/Settings/Ims/ListIms";
import ImportIms from "./Pages/Settings/Ims/ImportIms";

//Pharmacie
import AjouterPharmacie from "./Pages/Settings/Pharmacie/AjouterPharmacie";
import ListPharmacie from "./Pages/Settings/Pharmacie/ListPharmacie";

//pack
import AjouterPack from "./Pages/Settings/Pack/AjouterPack";
import ListPack from "./Pages/Settings/Pack/ListPack";

import NotFound from "./Pages/NotFound";
import Profile from "./Pages/Profile";
import TransformerBL from "./Pages/Delegue/TransformerBL";
import ListeProduits from "./Pages/ListeProduits";
import ValidationBl from "./Pages/ValidationBl";
import VisualisationBl from "./Pages/VisualisationBl";
import TelechargerFichier from "./Pages/TelechargerFichier";
import ComparaisonIms from "./Pages/Admin/ComparaisonIms";

//DashBoard
import Overview from "./Pages/Admin/DashBoard/Overview";
import BlIms from "./Pages/Admin/DashBoard/BlIms";
import SuperDashBoard from "./Pages/Admin/DashBoard/SuperDashBoard";
import PackDashBoard from "./Pages/Admin/DashBoard/PackDashBoard";
import DelegueDashboard from "./Pages/Admin/DashBoard/DelegueDashboard";

//Secteur
import AjouterSecteur from "./Pages/Settings/Secteur/AjouterSecteur";
import ListSecteur from "./Pages/Settings/Secteur/ListSecteur";

//Segment
import AjouterSegment from "./Pages/Settings/Segment/AjouterSegment";
import ListSegment from "./Pages/Settings/Segment/ListSegment";
import ListSegmentPharma from "./Pages/Settings/Segment/ListSegmentPharma";

//ActionCommercial
import ActionDashBoard from "./Pages/SuperViseur/ActionCommercial/ActionDashBoard";
import AjouterAction from "./Pages/SuperViseur/ActionCommercial/AjouterAction";
import ListAction from "./Pages/SuperViseur/ActionCommercial/ListAction";
import ListTodo from "./Pages/SuperViseur/ActionCommercial/TodoList/ListTodo";
import ListAssociation from "./Pages/SuperViseur/ActionCommercial/ListAssociation";
import DetailVisualisation from "./Pages/SuperViseur/ActionCommercial/Visualisation/DetailVisualisation";
import DetailValider from "./Pages/SuperViseur/ActionCommercial/Visualisation/DetailValider";
import ListVisualisation from "./Pages/SuperViseur/ActionCommercial/Visualisation/ListVisualisation";
import Messagerie from "./Pages/SuperViseur/ActionCommercial/Messagerie/Messagerie";
import ListSuivi from "./Pages/SuperViseur/ActionCommercial/SuiviAction/ListSuivi";
import DetailSuivi from "./Pages/SuperViseur/ActionCommercial/SuiviAction/DetailSuivi";

//IAMarketings
import Highlight from "./Pages/Admin/IAMarketings/Highlight";
import Mapping from "./Pages/Admin/IAMarketings/Mapping";
import Segments from "./Pages/Admin/IAMarketings/Segments";
import Clustring from "./Pages/Admin/IAMarketings/Clustring";
import Transition from "./Pages/Admin/IAMarketings/Transition";

//RootBase
import ListRootBase from "./Pages/Settings/RootBase/ListRootBase";
import AjouterRootBase from "./Pages/Settings/RootBase/AjouterRootBase";

//Atc
import AjouterAtc from "./Pages/Settings/Atc/AjouterAtc";
import ListAtc from "./Pages/Settings/Atc/ListAtc";

const Components = {
  DelegueDashboard,
  TransformerBL,
  ValidationBl,
  VisualisationBl,
  ActionDashBoard,
  ListAction,
  ListVisualisation,
  Messagerie,
  ListTodo,
  ListPharmacie,
  Profile,
  NotFound,
  Overview,
  ListProduit,
  ListProduitFour,
  ListeProduits,
  SuperDashBoard,
  BlIms,
  PackDashBoard,
  TelechargerFichier,
  ListRootBase,
  AjouterRootBase,
  /** tests **/
  ListUser,
  AjouterUser,
  ListRole,
  AjouterRole,
  Settings,
  AjouterProduit,
  AjouterLigneIms,
  ListLigneIms,
  ListMarcheIms,
  AjouterMarcheIms,
  AjouterFournisseur,
  ListFournisseur,
  AjouterIms,
  ListIms,
  ImportIms,
  AjouterPharmacie,
  AjouterPack,
  ListPack,
  ComparaisonIms,
  AjouterSecteur,
  ListSecteur,
  AjouterSegment,
  ListSegment,
  ListSegmentPharma,
  AjouterAction,
  ListAssociation,
  Highlight,
  Mapping,
  Segments,
  Clustring,
  Transition,
  AjouterAtc,
  ListAtc,
  DetailVisualisation,
  ListSuivi,
  DetailSuivi,
  DetailValider
};
export default Components;
