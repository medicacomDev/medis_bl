import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Form, Row, Col } from "react-bootstrap";
// react-bootstrap components
import ReactTable from "../../../../components/ReactTable/ReactTable.js";
import SweetAlert from "react-bootstrap-sweetalert";
import NotificationAlert from "react-notification-alert";
import Select from "react-select";
import { useDispatch } from "react-redux";
import { getProduits } from "../../../../Redux/atcReduce.js";
import { useCallback } from "react";

function TableAtc({ entities }) {
  const notificationAlertRef = React.useRef(null);
  const [array, setArray] = React.useState([]);
  const dispatch = useDispatch();

  const getProduitMarcheBD = useCallback(
    async (list1, array) => {
      var listHtml = [...array];
      list1.forEach((val, key) => {
        if (val.packId) {
          var findMarcheAtc = val.marches;
          var findProduitAtc = val.produits;
          //create html marche/produit
          var htmlArray = [];
          var objMarche = {};
          var arrayMarche = {};
          findMarcheAtc.forEach((element, key1) => {
            arrayMarche[element.id_marche] = key1;
            objMarche[element.id_marche] = element;
          });
          var objProduit = {};
          var arrayProduit = {};
          findProduitAtc.forEach((element, key1) => {
            arrayProduit[element.id_produit] = key1;
            if (!objProduit[element.id_marche]) {
              objProduit[element.id_marche] = [];
            }
            objProduit[element.id_marche].push(element);
          });

          for (const key1 in objMarche) {
            const element1 = objMarche[key1];
            const element2 = objProduit[key1];
            /* start push array marche */
            var tdArry = [];
            htmlArray.push(
              <tr className="success" key={"trm-head-" + key1}>
                <td><b>PRODUIT</b></td>
                <td>
                  <div className="div-hidden"></div>
                </td>
                <td>
                  <div className="div-hidden"></div>
                </td>
              </tr>
            );
            tdArry.push(
              <td key={"trm" + key1 + "-d-" + element1.id_marche}>
                {element1.marches.lib}
              </td>
            );
            tdArry.push(
              <td key={"trm" + key1 + "-qte-" + element1.id_marche}>{element1.quantite}</td>
            );
            tdArry.push(
              <td key={"trm" + key1 + "-mnt-" + element1.id_marche}>{element1.montant}</td>
            );
            htmlArray.push(
              <tr key={"trm-" + key1 + " " + element1.id_marche}>{tdArry}</tr>
            );
            /* end push array marche */

            /* start push array produit */
            htmlArray.push(
              <tr className="info" key={"trp-head-" + key1}>
                <td><b>PRESENTATION</b></td>
                <td>
                  <div className="div-hidden"></div>
                </td>
                <td>
                  <div className="div-hidden"></div>
                </td>
              </tr>
            );

            for (let index = 0; index < element2.length; index++) {
              const element3 = element2[index];
              var tdArry1 = [];
              tdArry1.push(
                <td key={"tr" + key1 + "-d-" + element3.id_produit}>
                  {element3.produits.designation}
                </td>
              );
              tdArry1.push(
                <td key={"tr" + key1 + "-qte-" + element3.id_produit}>{element3.quantite}</td>
              );
              tdArry1.push(
                <td key={"tr" + key1 + "-mnt-" + element3.id_produit}>{element3.montant}</td>
              );
              htmlArray.push(
                <tr key={"trp-" + index + " " + element3.id_produit}>
                  {tdArry1}
                </tr>
              );
            }
            /* end push array produit */
          }
          listHtml[key] = htmlArray;
        }
      });
      setArray(listHtml);
    },
    [dispatch]
  );
  useEffect(() => {
    getProduitMarcheBD(entities, array);
  }, [entities]);
  
  return (
    <>
      <div>
        {entities.map((val, key) => {
          return (
            <div key={"atc-" + key}>              
              <Row>
                <Col col="12">
                  <table className="table-hover table-striped w-full table table-pack">
                    <thead>
                      <tr className="tr-pack">
                        <th>Nom</th>
                        <th>Qte</th>
                        <th>Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{val.atcs.nom}</td>
                        <td>{val.quantite}</td>
                        <td>{val.montant}</td>
                      </tr>
                      {array[key]}
                    </tbody>
                  </table>
                </Col>
              </Row>
              <hr></hr>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default TableAtc;
