import React, { useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { saveFile64 } from "../../Redux/blReduce";
import { Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { cheeckFournisseur } from "../../Redux/fournisseurReduce";
import { cheeckProduit } from "../../Redux/produitReduce";
import jwt_decode from "jwt-decode";
import NotificationAlert from "react-notification-alert";
const videoConstraints = {
  width: 500,
  height: 600,
  facingMode: "environment"  
};

const Camera = ({ setData,setEntitiesEntete,setFournisseur,setSomme,setPackSelected }) => {
  var token = localStorage.getItem("x-access-token");
  var decoded = jwt_decode(token);
  const dispatch = useDispatch();
  const idrole = decoded.idrole;
  const idUser = decoded.id;
  const webcamRef = useRef(null);
  const [url, setUrl] = React.useState(null);
  const notificationAlertRef = React.useRef(null);
  const notify = (place, msg, type) => {
    var options = {};
    options = {
      place: place,
      message: (
        <div>
          <div>{msg}</div>
        </div>
      ),
      type: type,
      icon: "nc-icon nc-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };

  const capturePhoto = React.useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    /* dispatch(saveFile64({ imageSrc: imageSrc })).then((e) => {
      var res = e.payload;
      if (res.length !== 0) {
        checkFour(res[0], res);
      }
      checkProd(res);
    }); */
    setUrl(imageSrc);
  }, [webcamRef]);
  

  const onUserMedia = (e) => {
  };
  const setFour = React.useCallback(async (four, newDateFormat, idDelegue,fileName) => {
  /* function setFour(four, newDateFormat, idDelegue) { */
    var array = [];
    array.push({
      Adresse: null,
      Client: null,
      nomClient: null,
      Fournisseur: four,
      dateBL: newDateFormat,
      ims: null,
      numBl: null,
      iduser: idDelegue,
      id_pack: 0,
      file: fileName,
      action: null,
      numeroBL: null,
    });
    setEntitiesEntete(array);
  }, [setEntitiesEntete]);
  function setFormatDate(d) {
    var formatDate = null;
    if (d !== "" && d !== null) {
      var str = d.replaceAll("/", "");
      if (isNaN(str.trim()) === false) {
        var pos = d.indexOf("/");
        var dataFormat = "";
        var dateTrime = "";
        var dataSplit = "";
        if (pos !== -1) {
          dateTrime = d.trim();
          dataSplit = dateTrime.split("/");
          dataFormat = dataSplit[2] + "-" + dataSplit[1] + "-" + dataSplit[0];
        } else {
          dateTrime = d.trim();
          dataSplit = dateTrime.split("-");
          dataFormat = dataSplit[2] + "-" + dataSplit[1] + "-" + dataSplit[0];
        }
        var newDate = new Date(dataFormat);
        if (newDate === "Invalid Date") formatDate = null;
        else formatDate = dataFormat;
      }
    }
    return formatDate;
  }
  const checkFour = useCallback(
    async (four, entities,fileName) => {
      dispatch(cheeckFournisseur({ nomFournisseur: four.Fournisseur })).then(
        (rowsdes) => {
          var idDelegue = parseInt(idrole) === 2 ? idUser : null;
          var fo = rowsdes.payload;

          var newDateFormat = setFormatDate(entities[0].DateBL);
          var four = null;
          if (fo[0] !== null) {
            setFournisseur(fo[0][0]);
            four = fo[0][0];
          } else {
            setFournisseur(null);
          }
          setFour(four, newDateFormat, idDelegue,fileName);
        }
      );
    },
    [dispatch, idUser, idrole,setFour,setFournisseur]
  );
  const checkProd = useCallback(
    async (table) => {
      var arrayBody = [];
      dispatch(cheeckProduit(table)).then((rowsdes) => {
        var prod = rowsdes.payload;
        var som = 0;
        for (var i = 0; i < prod.length; i++) {
          var prix = 0;
          var qte = 0;
          if (!isNaN(parseFloat(table[i].Quantite))) {
            qte = parseFloat(table[i].Quantite);
          }
          if (!isNaN(parseFloat(table[i].Prix))) {
            prix = parseFloat(table[i].Prix);
          }
          var mnt = prix * qte;
          som += mnt;
          if (prod[i] !== null) {
            arrayBody.push({
              Designation: prod[i][0],
              Prix: prix,
              Quantite: qte,
              Code: table[i].Code,
              Montant: mnt.toFixed(3),
              idProduit: prod[i][2],
              id_pack: null,
              quantite_pack: 0,
              id_atc: 0,
            });
          } else {
            arrayBody.push({
              Designation: table[i].Designation,
              Prix: prix,
              Quantite: qte,
              Code: table[i].Code,
              Montant: mnt.toFixed(3),
              idProduit: null,
              id_pack: null,
              quantite_pack: 0,
              id_atc: 0,
            });
          }
        }
        setData(arrayBody);
        setSomme(som.toFixed(3));
        document.getElementById("loaderTable").classList.add("hidden");
        notify("tr", "Extraction avec succes", "success");
        /* dispatch(getPrixProduit({arrayBody})).then((dataprod) => {
          var somFinal = dataprod.payload.som;
          var arrayFinal = dataprod.payload.arrayBody;
          setSomme(somFinal.toFixed(3));          
          dispatch(getPackByProduits({arrayFinal})).then((dataFinal) => {
            var ligneFinal= dataFinal.payload.arrayFinal;
            var packsFinal= dataFinal.payload.packSelected;
            setData(ligneFinal);
            setPackSelected(packsFinal);
            document.getElementById("loaderTable").classList.add("hidden");
          })
        }) */
        /* setData(arrayBody);
        setSomme(som.toFixed(3));
         */
        /* setEntities(arrayBody); */
      });
    },
    [dispatch,setData,setSomme]
  );
  function reset(){
    setUrl(null);
    setData([]);
    setFournisseur(null);
    setEntitiesEntete([]);
    setSomme(0.0);    
    var element = document.getElementById("table-BL");
    var element1 = document.getElementById("table-BL-header");
    element.classList.add("hidden");
    element1.classList.add("hidden");
  }
  const uploadFile = React.useCallback(async (file) => {
    var element = document.getElementById("table-BL");
    var element1 = document.getElementById("table-BL-header");
    element.classList.add("hidden");
    element1.classList.add("hidden");
    document.getElementById("loaderTable").classList.remove("hidden");
    dispatch(saveFile64({ imageSrc: file })).then((e) => {
      var res = e.payload.data;
      var fileName = e.payload.fileName;
      if (res.length !== 0) {
        checkFour(res[0], res, fileName);
      }
      checkProd(res);
    });
  }, [checkProd,checkFour,dispatch]);
  // using a local image file path - async-await
  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <Webcam
        ref={webcamRef}
        audio={true}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        onUserMedia={onUserMedia}
      />
      {url != null ? (
        <div>
          <img src={url} alt="Screenshot" />
          <br></br>
          <br></br>
          <Button
            className="btn-wd btn-outline mr-1 float-left extraction"
            onClick={() => reset()}
            id="annuler"
            type="button"
            variant="danger"
          >
            <span className="btn-label">
              <i className="fas fa-sync-alt"></i>
            </span>
            Refresh
          </Button>
          <Button
            className="btn-wd btn-outline mr-1 float-right extraction"
            id="blExt"
            type="button"
            variant="info"
            onClick={() => {
              uploadFile(url);
            }}
          >
            <span className="btn-label">
              <i className="fas fa-cogs"></i>
            </span>
            BL Extractions
          </Button>
          <div className="text-center">
            <img
              id="loaderTable"
              className="hidden"
              src={require("../../assets/img/loader.gif").default}
              alt="loader"
            />
          </div>
        </div>
      ) : (
        <div className="div-camera">
          <Button
            className="btn-wd btn-outline mr-1 extraction"
            id="blExt"
            type="button"
            variant="info"
            onClick={capturePhoto}
          >
            <span className="btn-label">
              <i className="fas fa-camera-retro"></i>
            </span>
            Capture
          </Button>
          <br></br>
          <br></br>
        </div>
      )}
    </>
  );
};

export default Camera;
